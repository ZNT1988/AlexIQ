// Owner Identity - Stub pour démarrage
export class OwnerIdentity {
  constructor() {
    this.owner = 'HustleFinder User';
  }

  static async initialize() {
    return new OwnerIdentity();
  }

  getOwnerInfo() {
    return {
      name: this.owner,
      permissions: ['full_access']
    };
  }
}

// Export functions pour compatibilité
export const getOwnerIdentity = () => new OwnerIdentity().getOwnerInfo();

export default new OwnerIdentity();