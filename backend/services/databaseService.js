// Firebase Firestore Database Service
const { db } = require('../config/firebase');
const { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} = require('firebase/firestore');

class DatabaseService {
  constructor() {
    this.db = db;
  }

  // Create a new document
  async createDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        id: docRef.id,
        message: 'Document created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get a document by ID
  async getDocument(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return {
          success: false,
          error: 'Document not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all documents from a collection
  async getDocuments(collectionName, options = {}) {
    try {
      let q = collection(this.db, collectionName);
      
      // Apply filters if provided
      if (options.where) {
        q = query(q, where(options.where.field, options.where.operator, options.where.value));
      }
      
      // Apply ordering if provided
      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
      }
      
      // Apply limit if provided
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return {
        success: true,
        data: documents
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update a document
  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Document updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete a document
  async deleteDocument(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Document deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Repository Analysis specific methods
  async saveAnalysisResult(userId, analysisData) {
    try {
      const result = await this.createDocument('analysis_results', {
        userId,
        repositoryUrl: analysisData.repositoryUrl,
        analysisData: analysisData.analysis,
        generatedFiles: analysisData.generated,
        issues: analysisData.issues,
        files: analysisData.files,
        status: 'completed'
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserAnalysisHistory(userId) {
    try {
      const result = await this.getDocuments('analysis_results', {
        where: { field: 'userId', operator: '==', value: userId },
        orderBy: { field: 'createdAt', direction: 'desc' }
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveUserProfile(userId, profileData) {
    try {
      const result = await this.createDocument('user_profiles', {
        userId,
        ...profileData
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserProfile(userId) {
    try {
      const result = await this.getDocuments('user_profiles', {
        where: { field: 'userId', operator: '==', value: userId }
      });
      
      if (result.success && result.data.length > 0) {
        return {
          success: true,
          data: result.data[0]
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new DatabaseService();
