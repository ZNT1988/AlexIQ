/**
 * Owner Identity Module for Railway deployment
 * Simple implementation for production stability
 */

class OwnerIdentity {
    constructor() {
        this.name = process.env.OWNER_NAME || 'AlexIQ Owner';
        this.id = process.env.OWNER_ID || 'alexiq-owner-001';
        this.role = 'system-owner';
        this.permissions = ['all'];
        this.initialized = false;
    }

    async initialize() {
        try {
            this.initialized = true;
            console.log(`Owner Identity initialized: ${this.name}`);
            return this;
        } catch (error) {
            console.warn('Owner Identity initialization warning:', error);
            this.initialized = true; // Continue anyway
            return this;
        }
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }

    getRole() {
        return this.role;
    }

    getPermissions() {
        return this.permissions;
    }

    hasPermission(permission) {
        return this.permissions.includes('all') || this.permissions.includes(permission);
    }

    isInitialized() {
        return this.initialized;
    }

    getProfile() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            permissions: this.permissions,
            initialized: this.initialized
        };
    }
}

// Singleton instance
let ownerInstance = null;

export async function getOwnerIdentity() {
    if (!ownerInstance) {
        ownerInstance = new OwnerIdentity();
        await ownerInstance.initialize();
    }
    return ownerInstance;
}

export { OwnerIdentity };
export default OwnerIdentity;