import mongoose from 'mongoose';

// User Schema for JWT authentication
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'guest_user'
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  rawText: {
    type: String,
    required: true
  },
  fullText: {
    type: String
  },
  parsedData: {
    type: mongoose.Schema.Types.Mixed
  },
  targetRole: {
    type: String,
    default: 'Software Engineer'
  },
  atsScore: {
    type: Number,
    default: 75
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create model
export const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

const resumeChunkSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'guest_user'
  },
  resumeId: {
    type: String,
    required: true,
    index: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sectionHint: {
    type: String,
    default: 'General'
  },
  keywords: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const ResumeChunk = mongoose.models.ResumeChunk || mongoose.model('ResumeChunk', resumeChunkSchema);

// In-memory fallback repositories when MongoDB connection is not active
const inMemoryUsers = [];
const inMemoryResumes = [];
const inMemoryChunks = [];

let isConnected = false;

/**
 * Sanitize and format MongoDB URI (encodes special characters like @, %, # in username/password)
 */
function formatMongoUri(uri) {
  if (!uri) return uri;
  try {
    const protoMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (!protoMatch) return uri;
    const proto = protoMatch[1];
    const rest = protoMatch[2];

    const slashOrQuestion = rest.search(/[\/\?]/);
    const authAndHost = slashOrQuestion === -1 ? rest : rest.slice(0, slashOrQuestion);
    const pathAndQuery = slashOrQuestion === -1 ? '' : rest.slice(slashOrQuestion);

    // The credentials and host are separated by the LAST '@' before '/' or '?'
    const lastAt = authAndHost.lastIndexOf('@');
    if (lastAt === -1) {
      return uri; // No credentials in URI
    }

    const authPart = authAndHost.slice(0, lastAt);
    const hostPart = authAndHost.slice(lastAt + 1);

    // Username and password are separated by the first ':'
    const firstColon = authPart.indexOf(':');
    let username = authPart;
    let password = '';
    if (firstColon !== -1) {
      username = authPart.slice(0, firstColon);
      password = authPart.slice(firstColon + 1);
    }

    const safeEncode = (str) => {
      if (!str) return '';
      try {
        return encodeURIComponent(decodeURIComponent(str));
      } catch (e) {
        return encodeURIComponent(str);
      }
    };

    const encodedUser = safeEncode(username);
    const encodedPass = safeEncode(password);

    return `${proto}${encodedUser}${encodedPass ? ':' + encodedPass : ''}@${hostPart}${pathAndQuery}`;
  } catch (e) {
    return uri;
  }
}

/**
 * Safely mask user password in URI for logging
 */
function maskMongoUri(uri) {
  if (!uri) return '';
  try {
    const protoMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (!protoMatch) return uri.replace(/:([^@]+)@/, ':****@');
    const proto = protoMatch[1];
    const rest = protoMatch[2];
    const slashOrQuestion = rest.search(/[\/\?]/);
    const authAndHost = slashOrQuestion === -1 ? rest : rest.slice(0, slashOrQuestion);
    const pathAndQuery = slashOrQuestion === -1 ? '' : rest.slice(slashOrQuestion);

    const lastAt = authAndHost.lastIndexOf('@');
    if (lastAt === -1) return uri;
    const authPart = authAndHost.slice(0, lastAt);
    const hostPart = authAndHost.slice(lastAt + 1);

    const firstColon = authPart.indexOf(':');
    const username = firstColon === -1 ? authPart : authPart.slice(0, firstColon);
    return `${proto}${username}:****@${hostPart}${pathAndQuery}`;
  } catch (e) {
    return 'mongodb+srv:****';
  }
}

/**
 * Initialize MongoDB connection
 */
export async function connectDB() {
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!rawUri) {
    console.warn('[MongoDB] ⚠️ No MONGO_URI found in environment. Using in-memory fallback storage.');
    return { connected: false, mode: 'in-memory' };
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return { connected: true, mode: 'mongodb' };
  }

  const formattedUri = formatMongoUri(rawUri);

  try {
    const conn = await mongoose.connect(formattedUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] ✅ Connected successfully: ${conn.connection.host}`);
    return { connected: true, mode: 'mongodb' };
  } catch (error) {
    console.error(`[MongoDB] ❌ Connection failed to ${maskMongoUri(rawUri)}: ${error.message}`);
    isConnected = false;
    return { connected: false, mode: 'in-memory', error: error.message };
  }
}

/**
 * Persist a resume document to MongoDB or in-memory fallback
 */
export async function saveResumeRecord(data) {
  // Debug log required by specifications
  console.log("Resume stored");

  const resumePayload = {
    ...data,
    fullText: data.fullText || data.rawText,
    userId: data.userId || 'guest_user'
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const newResume = await Resume.create(resumePayload);
      return {
        id: newResume._id.toString(),
        record: newResume,
        savedToMongoDB: true
      };
    }
  } catch (err) {
    console.warn('[MongoDB] Error saving with Mongoose, using in-memory store:', err.message);
  }

  // In-memory fallback
  const mockId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const record = {
    _id: mockId,
    ...resumePayload,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryResumes.unshift(record);
  
  return {
    id: mockId,
    record,
    savedToMongoDB: false
  };
}

/**
 * User CRUD Operations (MongoDB + In-Memory Fallback)
 */
export async function findUserByEmail(email) {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) return user;
    }
  } catch (err) {
    console.warn('[MongoDB] Error finding user by email:', err.message);
  }
  return inMemoryUsers.find(u => u.email === normalizedEmail) || null;
}

export async function findUserById(id) {
  if (!id) return null;
  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const user = await User.findById(id);
      if (user) return user;
    }
  } catch (err) {
    console.warn('[MongoDB] Error finding user by id:', err.message);
  }
  return inMemoryUsers.find(u => u._id === id || u.id === id) || null;
}

export async function createUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.create({
        name,
        email: normalizedEmail,
        password
      });
      return {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt
      };
    }
  } catch (err) {
    console.warn('[MongoDB] Error creating user with Mongoose, using in-memory fallback:', err.message);
  }

  const mockUserId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const user = {
    id: mockUserId,
    _id: mockUserId,
    name,
    email: normalizedEmail,
    password,
    createdAt: new Date()
  };
  inMemoryUsers.push(user);
  return user;
}

/**
 * Retrieve the most recently saved resume
 */
export async function getLatestResumeRecord() {
  try {
    if (mongoose.connection.readyState === 1) {
      const doc = await Resume.findOne().sort({ createdAt: -1 });
      if (doc) return doc;
    }
  } catch (err) {
    console.warn('[MongoDB] Error finding latest resume:', err.message);
  }
  return inMemoryResumes[0] || null;
}

/**
 * Retrieve all saved resumes
 */
export async function getResumeHistory(limit = 20) {
  try {
    if (mongoose.connection.readyState === 1) {
      const docs = await Resume.find().sort({ createdAt: -1 }).limit(limit);
      return docs;
    }
  } catch (err) {
    console.warn('[MongoDB] Error fetching history with Mongoose:', err.message);
  }
  return inMemoryResumes.slice(0, limit);
}

/**
 * Retrieve a single resume by ID
 */
export async function getResumeByIdRecord(id) {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      const doc = await Resume.findById(id);
      if (doc) return doc;
    }
  } catch (err) {
    console.warn('[MongoDB] Error finding resume by id:', err.message);
  }
  return inMemoryResumes.find(r => r._id === id || r.id === id) || null;
}

/**
 * Save resume chunks to MongoDB or in-memory fallback
 */
export async function saveResumeChunks(resumeId, chunks) {
  if (!chunks || chunks.length === 0) return [];

  const docsToInsert = chunks.map((chunk, idx) => ({
    resumeId,
    chunkIndex: chunk.chunkIndex !== undefined ? chunk.chunkIndex : idx,
    text: chunk.text,
    sectionHint: chunk.sectionHint || 'General',
    keywords: chunk.keywords || []
  }));

  try {
    if (mongoose.connection.readyState === 1) {
      // Remove previous chunks for this resume if any, then insert new
      await ResumeChunk.deleteMany({ resumeId });
      const inserted = await ResumeChunk.insertMany(docsToInsert);
      return inserted;
    }
  } catch (err) {
    console.warn('[MongoDB] Error saving chunks with Mongoose:', err.message);
  }

  // In-memory fallback
  // Remove existing chunks for this resume
  for (let i = inMemoryChunks.length - 1; i >= 0; i--) {
    if (inMemoryChunks[i].resumeId === resumeId) {
      inMemoryChunks.splice(i, 1);
    }
  }

  const savedMemory = docsToInsert.map((d, i) => ({
    _id: `chunk_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
    ...d,
    createdAt: new Date()
  }));

  inMemoryChunks.push(...savedMemory);
  return savedMemory;
}

/**
 * Retrieve chunks for a specific resume
 */
export async function getResumeChunks(resumeId) {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = resumeId ? { resumeId } : {};
      const chunks = await ResumeChunk.find(query).sort({ chunkIndex: 1 });
      if (chunks && chunks.length > 0) {
        return chunks;
      }
    }
  } catch (err) {
    console.warn('[MongoDB] Error retrieving chunks:', err.message);
  }

  if (resumeId) {
    return inMemoryChunks.filter(c => c.resumeId === resumeId);
  }
  return inMemoryChunks;
}

/**
 * Retrieve all chunks across all stored resumes
 */
export async function getAllResumeChunks() {
  try {
    if (mongoose.connection.readyState === 1) {
      const chunks = await ResumeChunk.find().sort({ createdAt: -1 });
      if (chunks && chunks.length > 0) return chunks;
    }
  } catch (err) {
    console.warn('[MongoDB] Error retrieving all chunks:', err.message);
  }
  return inMemoryChunks;
}

export default {
  Resume,
  ResumeChunk,
  connectDB,
  saveResumeRecord,
  getResumeHistory,
  getResumeByIdRecord,
  saveResumeChunks,
  getResumeChunks,
  getAllResumeChunks
};
