export interface CreatorMetadata {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  goal?: string;
  walletAddress: string;
  createdAt: string;
}

class LocalStorageManager {
  saveCreatorMetadata(metadata: CreatorMetadata): string {
    const id = `creator_${metadata.walletAddress}`;
    try {
      localStorage.setItem(id, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save creator metadata:', error);
    }
    return id;
  }

  getCreatorMetadata(id: string): CreatorMetadata | null {
    try {
      const data = localStorage.getItem(id);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve creator metadata:', error);
      return null;
    }
  }

  getAllCreators(): CreatorMetadata[] {
    const creators: CreatorMetadata[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('creator_')) {
          const data = this.getCreatorMetadata(key);
          if (data) creators.push(data);
        }
      }
    } catch (error) {
      console.error('Failed to retrieve all creators:', error);
    }
    return creators;
  }
}

export const localStorageManager = new LocalStorageManager();
