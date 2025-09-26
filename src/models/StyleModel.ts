// Style data model interfaces
export interface StyleMetadata {
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number;
}

export interface Style {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'objects' | 'female' | 'male';
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  metadata: StyleMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface StylesResponse {
  success: boolean;
  data: Style[];
  message?: string;
  timestamp: string;
}

export interface StylesByCategory {
  objects: Style[];
  female: Style[];
  male: Style[];
}

// API Error interface
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}
