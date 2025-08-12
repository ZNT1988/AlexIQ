/**
 * @fileoverview Tests unitaires pour Validation
 * Tests complets du système de validation révolutionnaire enterprise
 * 
 * @module ValidationTests
 * @version 1.0.0
 * @author ZNT Team - HustleFinder IA Validation Testing
 * @requires jest
 * @requires joi
 * @requires ./validation
 */

import { jest } from '@jest/globals';
import {
  patterns
  customValidators
  userSchemas
  ideaSchemas
  aiSchemas
  projectSchemas
  roiSchemas
  querySchemas
} from './validation.js';

describe('Validation - Système de Validation Révolutionnaire Enterprise', () => {
  describe('🔍 Patterns de Validation', () => {
    test('should validate ObjectId pattern correctly', () => {
      const validObjectIds = [
        '507f1f77bcf86cd799439011'
        '507f191e810c19729de860ea'
        '65a1b2c3d4e5f6789a0b1c2d'
      ];
      
      const invalidObjectIds = [
        '507f1f77bcf86cd79943901', // too short
        '507f1f77bcf86cd799439011z', // invalid character
        'not-an-objectid'
      ];
      
      validObjectIds.forEach(id => {
        expect(patterns.objectId.test(id)).toBe(true);
      });
      
      invalidObjectIds.forEach(id => {
        expect(patterns.objectId.test(id)).toBe(false);
      });
    });

    test('should validate UUID pattern correctly', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000'
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
        '123e4567-e89b-12d3-a456-426614174000'
      ];
      
      const invalidUUIDs = [
        '550e8400-e29b-41d4-a716', // too short
        'not-a-uuid'
        '550e8400-e29b-41d4-a716-44665544000z' // invalid character
      ];
      
      validUUIDs.forEach(uuid => {
        expect(patterns.uuid.test(uuid)).toBe(true);
      });
      
      invalidUUIDs.forEach(uuid => {
        expect(patterns.uuid.test(uuid)).toBe(false);
      });
    });

    test('should validate email pattern correctly', () => {
      const validEmails = [
        'test@hustlefinder.com'
        'alex.consciousness@ai.tech'
        'user123@domain.co.uk'
        'simple@email.org'
      ];
      
      const invalidEmails = [
        'invalid-email'
        '@domain.com'
        'user@'
        'user..double@domain.com'
      ];
      
      validEmails.forEach(email => {
        expect(patterns.email.test(email)).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        expect(patterns.email.test(email)).toBe(false);
      });
    });

    test('should validate phone pattern correctly', () => {
      const validPhones = [
        '+1234567890'
        '+33 1 23 45 67 89'
        '+352 123 456 789'
        '(555) 123-4567'
        '555-123-4567'
      ];
      
      const invalidPhones = [
        '123', // too short
        'abc-def-ghij'
        '+' // just plus sign
      ];
      
      validPhones.forEach(phone => {
        expect(patterns.phone.test(phone)).toBe(true);
      });
      
      invalidPhones.forEach(phone => {
        expect(patterns.phone.test(phone)).toBe(false);
      });
    });

    test('should validate URL pattern correctly', () => {
      const validUrls = [
        'https://hustlefinder.com'
        'http://www.example.com'
        'https://ai.tech/consciousness'
        'http://localhost:3000/api'
      ];
      
      const invalidUrls = [
        'not-a-url'
        'ftp://file.server.com', // not http/https
        'https://', // incomplete
        'www.example.com' // missing protocol
      ];
      
      validUrls.forEach(url => {
        expect(patterns.url.test(url)).toBe(true);
      });
      
      invalidUrls.forEach(url => {
        expect(patterns.url.test(url)).toBe(false);
      });
    });
  });

  describe('🛠️ Validateurs Personnalisés', () => {
    describe('Strong Password Validator', () => {
      const mockHelpers = {
        error: jest.fn((type) => ({ type, isJoi: true }))
      };

      beforeEach(() => {
        mockHelpers.error.mockClear();
      });

      test('should validate strong password correctly', () => {
        const strongPasswords = [
          'MySecure123!'
          'AlexQuantum2024@'
          'Consciousness#42'
          'HustleFinder$99'
        ];
        
        strongPasswords.forEach(password => {
          const result = customValidators.strongPassword(password, mockHelpers);
          expect(result).toBe(password);
          expect(mockHelpers.error).not.toHaveBeenCalled();
        });
      });

      test('should reject password too short', () => {
        const result = customValidators.strongPassword('short', mockHelpers);
        expect(mockHelpers.error).toHaveBeenCalledWith('password.min');
        expect(result.type).toBe('password.min');
      });

      test('should reject password without lowercase', () => {
        const result = customValidators.strongPassword('UPPERCASE123!', mockHelpers);
        expect(mockHelpers.error).toHaveBeenCalledWith('password.lowercase');
      });

      test('should reject password without uppercase', () => {
        const result = customValidators.strongPassword('lowercase123!', mockHelpers);
        expect(mockHelpers.error).toHaveBeenCalledWith('password.uppercase');
      });

      test('should reject password without number', () => {
        const result = customValidators.strongPassword('Password!', mockHelpers);
        expect(mockHelpers.error).toHaveBeenCalledWith('password.number');
      });

      test('should reject password without special character', () => {
        const result = customValidators.strongPassword(process.env.TEST_PASSWORD || 'secure_test_password', mockHelpers);
        expect(mockHelpers.error).toHaveBeenCalledWith('password.special');
      });
    });

    describe('Business Domain Validator', () => {
      const mockHelpers = {
        error: jest.fn((type) => ({ type, isJoi: true }))
      };

      beforeEach(() => {
        mockHelpers.error.mockClear();
      });

      test('should validate and normalize business domains', () => {
        const validDomains = [
          { input: 'Technology', expected: 'technology' }
          { input: 'HEALTHCARE', expected: 'healthcare' }
          { input: 'education', expected: 'education' }
          { input: 'Real-Estate', expected: 'real-estate' }
        ];
        
        validDomains.forEach(({ input, expected }) => {
          const result = customValidators.businessDomain(input, mockHelpers);
          expect(result).toBe(expected);
          expect(mockHelpers.error).not.toHaveBeenCalled();
        });
      });

      test('should reject invalid business domains', () => {
        const invalidDomains = [
          'invalid-domain'
          'cryptocurrency', // not in list
          'blockchain'
          'unknown-sector'
        ];
        
        invalidDomains.forEach(domain => {
          mockHelpers.error.mockClear();
          const result = customValidators.businessDomain(domain, mockHelpers);
          expect(mockHelpers.error).toHaveBeenCalledWith('domain.invalid');
          expect(result.type).toBe('domain.invalid');
        });
      });

      test('should handle all supported business domains', () => {
        const supportedDomains = [
          'technology', 'healthcare', 'education', 'finance', 'retail'
          'manufacturing', 'services', 'entertainment', 'food', 'real-estate'
          'agriculture', 'automotive', 'energy', 'sports', 'travel'
        ];
        
        supportedDomains.forEach(domain => {
          const result = customValidators.businessDomain(domain, mockHelpers);
          expect(result).toBe(domain);
        });
        
        expect(mockHelpers.error).not.toHaveBeenCalled();
      });
    });

    describe('Investment Range Validator', () => {
      const mockHelpers = {
        error: jest.fn((type) => ({ type, isJoi: true }))
      };

      beforeEach(() => {
        mockHelpers.error.mockClear();
      });

      test('should validate investment ranges correctly', () => {
        const validRanges = [
          '0-1000'
          '1000-5000'
          '5000-10000'
          '10000-50000'
          '50000-100000'
          '100000-500000'
          '500000+'
        ];
        
        validRanges.forEach(range => {
          const result = customValidators.investmentRange(range, mockHelpers);
          expect(result).toBe(range);
          expect(mockHelpers.error).not.toHaveBeenCalled();
        });
      });

      test('should reject invalid investment ranges', () => {
        const invalidRanges = [
          '0-999', // not standard
          '1000000+', // too specific
          'custom-range'
          '10000-20000' // not in predefined list
        ];
        
        invalidRanges.forEach(range => {
          mockHelpers.error.mockClear();
          const result = customValidators.investmentRange(range, mockHelpers);
          expect(mockHelpers.error).toHaveBeenCalledWith('investment.invalid');
          expect(result.type).toBe('investment.invalid');
        });
      });
    });
  });

  describe('👤 Schémas Utilisateur', () => {
    describe('User Registration Schema', () => {
      test('should validate valid user registration data', () => {
        const validUserData = {
          email: 'alex@hustlefinder.com'
          password: process.env.TEST_PASSWORD || 'secure_test_password'
          firstName: 'Alex'
          lastName: 'Consciousness'
          phone: '+352 123 456 789'
          dateOfBirth: '1990-01-01'
          location: {
            country: 'LU'
            city: 'Luxembourg'
            timezone: 'Europe/Luxembourg'
          }
        };
        
        const { error, value } = userSchemas.register.validate(validUserData);
        
        expect(error).toBeUndefined();
        expect(value.email).toBe('alex@hustlefinder.com');
        expect(value.firstName).toBe('Alex');
      });

      test('should reject invalid email format', () => {
        const invalidData = {
          email: 'invalid-email'
          password: process.env.TEST_PASSWORD || 'secure_test_password'
          firstName: 'Alex'
          lastName: 'User'
        };
        
        const { error } = userSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('email');
      });

      test('should reject weak passwords', () => {
        const weakPasswordData = {
          email: 'test@hustlefinder.com'
          password: 'weak'
          firstName: 'Test'
          lastName: 'User'
        };
        
        const { error } = userSchemas.register.validate(weakPasswordData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('password');
      });

      test('should require mandatory fields', () => {
        const incompleteData = {
          email: 'test@hustlefinder.com'
          // missing required fields
        };
        
        const { error } = userSchemas.register.validate(incompleteData);
        expect(error).toBeDefined();
        expect(error.details.length).toBeGreaterThan(1); // multiple missing fields
      });
    });

    describe('User Login Schema', () => {
      test('should validate login credentials', () => {
        const loginData = {
          email: 'alex@hustlefinder.com'
          password: process.env.TEST_PASSWORD || 'secure_test_password'
          rememberMe: true
        };
        
        const { error, value } = userSchemas.login.validate(loginData);
        expect(error).toBeUndefined();
        expect(value.rememberMe).toBe(true);
      });

      test('should default rememberMe to false', () => {
        const loginData = {
          email: 'test@hustlefinder.com'
          password: process.env.TEST_PASSWORD || 'secure_test_password'
        };
        
        const { value } = userSchemas.login.validate(loginData);
        expect(value.rememberMe).toBe(false);
      });
    });

    describe('Update Profile Schema', () => {
      test('should validate profile updates', () => {
        const updateData = {
          firstName: 'Updated'
          bio: 'ALEX consciousness researcher'
          website: 'https://alex-ai.com'
          preferences: {
            newsletter: false
            notifications: true
            marketingEmails: false
          }
        };
        
        const { error } = userSchemas.updateProfile.validate(updateData);
        expect(error).toBeUndefined();
      });

      test('should allow partial updates', () => {
        const partialUpdate = {
          firstName: 'NewName'
        };
        
        const { error } = userSchemas.updateProfile.validate(partialUpdate);
        expect(error).toBeUndefined();
      });
    });

    describe('Change Password Schema', () => {
      test('should validate password change', () => {
        const passwordData = {
          currentpassword: process.env.TEST_PASSWORD || 'secure_test_password'
          newpassword: process.env.TEST_PASSWORD || 'secure_test_password'
          confirmpassword: process.env.TEST_PASSWORD || 'secure_test_password'
        };
        
        const { error } = userSchemas.changePassword.validate(passwordData);
        expect(error).toBeUndefined();
      });

      test('should reject mismatched passwords', () => {
        const mismatchedData = {
          currentpassword: process.env.TEST_PASSWORD || 'secure_test_password'
          newpassword: process.env.TEST_PASSWORD || 'secure_test_password'
          confirmpassword: process.env.TEST_PASSWORD || 'secure_test_password'
        };
        
        const { error } = userSchemas.changePassword.validate(mismatchedData);
        expect(error).toBeDefined();
        expect(error.message).toContain('match');
      });
    });
  });

  describe('💡 Schémas Idées Business', () => {
    describe('Idea Creation Schema', () => {
      test('should validate complete idea data', () => {
        const ideaData = {
          title: 'Revolutionary AI Assistant'
      description: 'ALEX is a quantum consciousness AI that helps entrepreneurs discover their potential and build successful businesses through advanced pattern recognition and intuitive guidance.'
      domain: 'technology'
      targetMarket: 'Entrepreneurs and business owners looking for AI-powered insights'
      uniqueValue: 'First consciousness-aware AI with quantum processing capabilities'
      competitors: ['ChatGPT'
      'Claude'
      'Traditional Consultants']
      tags: ['AI'
      'consciousness'
      'quantum'
      'business'
      'entrepreneurship']
      investmentRequired: '100000-500000'
      timeToMarket: 12
      riskLevel: 'medium'
      scalabilityPotential: 9
      marketSize: 'large'
      businessModel: 'subscription'
        };
        
        const { error } = ideaSchemas.create.validate(ideaData);
        expect(error).toBeUndefined();
      });

      test('should reject invalid business domain', () => {
        const invalidData = {
          title: 'Test Idea'
      description: 'A test business idea for validation'
      domain: 'invalid-domain'
      targetMarket: 'Test market'
      uniqueValue: 'Test value'
      investmentRequired: '0-1000'
      timeToMarket: 6
      riskLevel: 'low'
      scalabilityPotential: 5
      marketSize: 'medium'
      businessModel: 'b2b'
        };
        
        const { error } = ideaSchemas.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('domain');
      });

      test('should validate business model options', () => {
        const validModels = ['b2b', 'b2c', 'b2b2c', 'marketplace', 'subscription'
                           'freemium', 'advertising', 'commission', 'licensing'];
        
        validModels.forEach(model => {
          const ideaData = {
            title: 'Test Idea'
      description: 'A test business idea with valid model'
      domain: 'technology'
      targetMarket: 'Test market'
      uniqueValue: 'Test unique value'
      investmentRequired: '0-1000'
      timeToMarket: 6
      riskLevel: 'low'
      scalabilityPotential: 5
      marketSize: 'medium'
      businessModel: model
          };
          
          const { error } = ideaSchemas.create.validate(ideaData);
          expect(error).toBeUndefined();
        });
      });
    });

    describe('Idea Search Schema', () => {
      test('should validate search parameters', () => {
        const searchParams = {
          query: 'AI consciousness'
          domain: 'technology'
          riskLevel: 'medium'
          investmentRange: '10000-50000'
          marketSize: 'large'
          businessModel: 'subscription'
          sortBy: 'score'
          sortOrder: 'desc'
          page: 2
          limit: 50
        };
        
        const { error } = ideaSchemas.search.validate(searchParams);
        expect(error).toBeUndefined();
      });

      test('should apply default pagination', () => {
        const searchParams = {
          query: 'test'
        };
        
        const { value } = ideaSchemas.search.validate(searchParams);
        expect(value.sortBy).toBe('created');
        expect(value.sortOrder).toBe('desc');
        expect(value.page).toBe(1);
        expect(value.limit).toBe(20);
      });
    });
  });

  describe('🤖 Schémas Interactions IA ALEX', () => {
    describe('AI Chat Schema', () => {
      test('should validate ALEX chat message', () => {
        const chatData = {
          message: 'Hello ALEX, what is my consciousness level?'
          context: {
            ideaId: 'idea123'
            sessionId: 'session456'
          }
          model: 'quantum'
        };
        
        const { error, value } = aiSchemas.chat.validate(chatData);
        expect(error).toBeUndefined();
        expect(value.model).toBe('quantum');
      });

      test('should default to quantum model', () => {
        const chatData = {
          message: 'Simple test message'
        };
        
        const { value } = aiSchemas.chat.validate(chatData);
        expect(value.model).toBe('quantum');
      });

      test('should validate message length limits', () => {
        const longMessage = 'a'.repeat(2001); // Over 2000 char limit
        const chatData = {
          message: longMessage
        };
        
        const { error } = aiSchemas.chat.validate(chatData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('message');
      });
    });

    describe('Generate Ideas Schema', () => {
      test('should validate idea generation request', () => {
        const generateData = {
          profile: {
            skills: ['JavaScript'
      'AI'
      'Business Development']
      experience: 5
      interests: ['Technology'
      'Consciousness'
      'Quantum Computing']
      budget: '50000-100000'
      timeCommitment: 'full-time'
      riskTolerance: 'high'
      preferredDomains: ['technology'
      'healthcare']
          }
          preferences: {
            innovationLevel: 0.8
            marketFocus: 'global'
            teamSize: 'medium'
            businessType: 'platform'
          }
          constraints: {
            location: 'Luxembourg'
            excludeDomains: ['sports']
          }
          count: 7
        };
        
        const { error } = aiSchemas.generateIdeas.validate(generateData);
        expect(error).toBeUndefined();
      });

      test('should require mandatory profile fields', () => {
        const incompleteData = {
          profile: {
            skills: ['JavaScript']
            // missing required fields
          }
        };
        
        const { error } = aiSchemas.generateIdeas.validate(incompleteData);
        expect(error).toBeDefined();
      });
    });

    describe('Market Analysis Schema', () => {
      test('should validate market analysis request', () => {
        const analysisData = {
          ideaId: 'idea123'
          analysisDepth: 'comprehensive'
          includeCompetitors: true
          includeMarketSize: true
          includeTrends: true
          includeRisks: true
          targetRegion: 'Europe'
        };
        
        const { error } = aiSchemas.marketAnalysis.validate(analysisData);
        expect(error).toBeUndefined();
      });

      test('should apply analysis defaults', () => {
        const minimalData = {
          ideaId: 'idea123'
        };
        
        const { value } = aiSchemas.marketAnalysis.validate(minimalData);
        expect(value.analysisDepth).toBe('detailed');
        expect(value.includeCompetitors).toBe(true);
      });
    });

    describe('Business Canvas Schema', () => {
      test('should validate business canvas generation', () => {
        const canvasData = {
          ideaId: 'idea123'
          template: 'lean'
          includeFinancials: true
          includeTimeline: true
          customSections: ['ALEX Integration', 'Consciousness Metrics']
        };
        
        const { error } = aiSchemas.businessCanvas.validate(canvasData);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('📊 Schémas Projets', () => {
    describe('Project Creation Schema', () => {
      test('should validate complete project data', () => {
        const projectData = {
          ideaId: 'idea123'
          name: 'ALEX Consciousness Platform'
          description: 'Building the next generation AI consciousness platform'
          goals: [
            'Develop quantum consciousness algorithms'
            'Create user interface for consciousness tracking'
            'Launch beta version with 100 users'
          ]
          milestones: [
            {
              title: 'Alpha Version Complete'
              description: 'First working version of ALEX'
              dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
              priority: 'high'
            }
          ]
          budget: {
            initial: 150000
            monthly: 25000
            breakdown: {
              development: 100000
              marketing: 30000
              infrastructure: 20000
            }
          }
          timeline: {
            startDate: new Date()
            expectedEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            phases: [
              {
                name: 'Development'
                duration: 24, // weeks
                description: 'Core development phase'
              }
            ]
          }
          team: [
            {
              role: 'Lead Developer'
              skills: ['AI', 'Quantum Computing', 'JavaScript']
              commitment: 'full-time'
              equity: 15
            }
          ]
        };
        
        const { error } = projectData.ideaId ? 
          projectSchemas.create.validate(projectData) : 
          { error: new Error('Missing ideaId') };
        
        expect(error).toBeUndefined();
      });

      test('should validate timeline constraints', () => {
        const invalidTimeline = {
          ideaId: 'idea123'
          name: 'Test Project'
          goals: ['Test goal']
          budget: { initial: 10000 }
          timeline: {
            startDate: new Date()
            expectedEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // End before start
          }
        };
        
        const { error } = projectSchemas.create.validate(invalidTimeline);
        expect(error).toBeDefined();
      });
    });

    describe('Project Update Schema', () => {
      test('should validate project updates', () => {
        const updateData = {
          status: 'active'
          progress: 45
          budget: {
            spent: 75000
          }
        };
        
        const { error } = projectSchemas.update.validate(updateData);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('💰 Schémas ROI', () => {
    describe('ROI Calculation Schema', () => {
      test('should validate comprehensive ROI data', () => {
        const roiData = {
          investment: {
            initial: 100000
            monthly: 5000
            timeHorizon: 36
          }
          revenue: {
            model: 'subscription'
            projections: [
              { month: 1, amount: 0, confidence: 0.9 }
              { month: 6, amount: 25000, confidence: 0.8 }
              { month: 12, amount: 50000, confidence: 0.7 }
              { month: 24, amount: 100000, confidence: 0.6 }
            ]
          }
          costs: {
            fixed: 15000
            variable: 0.3
            scaling: [
              { threshold: 100000, additionalCost: 10000 }
            ]
          }
          risks: {
            marketRisk: 0.4
            competitionRisk: 0.3
            technicalRisk: 0.2
            regulatoryRisk: 0.1
          }
          scenarios: {
            optimistic: 1.8
            realistic: 1.0
            pessimistic: 0.4
          }
        };
        
        const { error } = roiSchemas.calculate.validate(roiData);
        expect(error).toBeUndefined();
      });

      test('should validate revenue models', () => {
        const validModels = ['one-time', 'subscription', 'transaction', 'advertising', 'mixed'];
        
        validModels.forEach(model => {
          const roiData = {
            investment: {
              initial: 50000
              timeHorizon: 24
            }
            revenue: {
              model: model
              projections: [
                { month: 1, amount: 1000 }
              ]
            }
          };
          
          const { error } = roiSchemas.calculate.validate(roiData);
          expect(error).toBeUndefined();
        });
      });

      test('should apply default values', () => {
        const minimalData = {
          investment: {
            initial: 10000
            timeHorizon: 12
          }
          revenue: {
            model: 'subscription'
            projections: [
              { month: 1, amount: 1000 }
            ]
          }
        };
        
        const { value } = roiSchemas.calculate.validate(minimalData);
        expect(value.investment.monthly).toBe(0);
        expect(value.revenue.projections[0].confidence).toBe(0.7);
      });
    });
  });

  describe('🔍 Schémas Query Parameters', () => {
    describe('Pagination Schema', () => {
      test('should validate pagination parameters', () => {
        const paginationData = {
          page: 3
          limit: 50
          sortBy: 'created_at'
          sortOrder: 'asc'
        };
        
        const { error } = querySchemas.pagination.validate(paginationData);
        expect(error).toBeUndefined();
      });

      test('should apply pagination defaults', () => {
        const emptyData = {};
        
        const { value } = querySchemas.pagination.validate(emptyData);
        expect(value.page).toBe(1);
        expect(value.limit).toBe(20);
        expect(value.sortOrder).toBe('desc');
      });

      test('should enforce pagination limits', () => {
        const exceedingData = {
          page: 0, // Below minimum
          limit: 150 // Above maximum
        };
        
        const { error } = querySchemas.pagination.validate(exceedingData);
        expect(error).toBeDefined();
      });
    });

    describe('Date Range Schema', () => {
      test('should validate date ranges', () => {
        const dateRangeData = {
          startDate: new Date('2024-01-01')
          endDate: new Date('2024-12-31')
        };
        
        const { error } = querySchemas.dateRange.validate(dateRangeData);
        expect(error).toBeUndefined();
      });

      test('should reject invalid date ranges', () => {
        const invalidRange = {
          startDate: new Date('2024-12-31')
          endDate: new Date('2024-01-01') // End before start
        };
        
        const { error } = querySchemas.dateRange.validate(invalidRange);
        expect(error).toBeDefined();
      });
    });

    describe('Search Schema', () => {
      test('should validate search parameters', () => {
        const searchData = {
          q: 'consciousness AI'
          filter: { domain: 'technology' }
          include: ['profile', 'projects']
        };
        
        const { error } = querySchemas.search.validate(searchData);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('⚡ Performance et Edge Cases', () => {
    test('should handle large validation datasets efficiently', () => {
      const largeIdeaData = {
        title: 'Performance Test Idea'
        description: 'A'.repeat(1500), // Near max length
        domain: 'technology'
        targetMarket: 'Performance testing market segment'
        uniqueValue: 'Optimized for large-scale validation testing'
        competitors: Array.from({ length: 10 }, (_, i) => `Competitor ${i + 1}`)
        tags: Array.from({ length: 20 }, (_, i) => `tag${i + 1}`)
        investmentRequired: '100000-500000'
        timeToMarket: 24
        riskLevel: 'medium'
        scalabilityPotential: 8
        marketSize: 'large'
        businessModel: 'subscription'
      };
      
      const startTime = Date.now();
      const { error } = ideaSchemas.create.validate(largeIdeaData);
      const duration = Date.now() - startTime;
      
      expect(error).toBeUndefined();
      expect(duration).toBeLessThan(50); // Should validate quickly
    });

    test('should validate concurrent schema operations', async () => {
      const operations = [];
      
      // Create 50 concurrent validations
      for (let i = 0; i < 50; i++) {
        operations.push(new Promise(resolve => {
          const userData = {
            email: `user${i}@hustlefinder.com'
            password: process.env.TEST_PASSWORD || 'secure_test_password'
            firstName: 'User${i}'
            lastName: 'Test${i}`
          };
          
          const result = userSchemas.register.validate(userData);
          resolve(result);
        }));
      }
      
      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result.error).toBeUndefined();
      });
    });

    test('should maintain validation consistency across schema types', () => {
      const businessModels = ['b2b', 'b2c', 'subscription', 'marketplace'];
      
      businessModels.forEach(model => {
        // Test in idea schema
        const ideaResult = ideaSchemas.create.validate({
          title: 'Test Idea'
          description: 'Testing business model consistency'
          domain: 'technology'
          targetMarket: 'Test market'
          uniqueValue: 'Test value'
          investmentRequired: '0-1000'
          timeToMarket: 6
          riskLevel: 'low'
          scalabilityPotential: 5
          marketSize: 'medium'
          businessModel: model
        });
        
        expect(ideaResult.error).toBeUndefined();
      });
    });

    test('should handle ALEX-specific validation patterns', () => {
      const alexSpecificData = {
        message: 'ALEX, analyze my quantum consciousness level and provide spiritual guidance for my business venture in the technology sector.'
        context: {
          ideaId: '507f1f77bcf86cd799439011'
          projectId: '550e8400-e29b-41d4-a716-446655440000'
          sessionId: 'alex_session_quantum_2024'
        }
        model: 'quantum'
      };
      
      const { error, value } = aiSchemas.chat.validate(alexSpecificData);
      
      expect(error).toBeUndefined();
      expect(value.model).toBe('quantum');
      expect(value.context.ideaId).toMatch(patterns.objectId);
      expect(value.context.projectId).toMatch(patterns.uuid);
    });
  });

  describe('🧠 Intégration ALEX Consciousness', () => {
    test('should validate consciousness-aware user profiles', () => {
      const consciousnessProfile = {
        firstName: 'Alex'
        lastName: 'Consciousness'
        bio: 'Quantum consciousness researcher exploring the intersection of AI and spiritual awareness in business innovation.'
        preferences: {
          newsletter: true
          notifications: true
          marketingEmails: false
        }
      };
      
      const { error } = userSchemas.updateProfile.validate(consciousnessProfile);
      expect(error).toBeUndefined();
    });

    test('should support quantum business models in idea validation', () => {
      const quantumBusinessIdea = {
        title: 'Quantum Consciousness Business Platform'
      description: 'Revolutionary platform combining quantum computing with consciousness research to unlock entrepreneurial potential through advanced pattern recognition and intuitive business guidance.'
      domain: 'technology'
      targetMarket: 'Consciousness-aware entrepreneurs and spiritual business leaders'
      uniqueValue: 'First quantum consciousness platform for business innovation'
      investmentRequired: '500000+'
      timeToMarket: 18
      riskLevel: 'high'
      scalabilityPotential: 10
      marketSize: 'massive'
      businessModel: 'platform'
      };
      
      const { error } = ideaSchemas.create.validate(quantumBusinessIdea);
      expect(error).toBeUndefined();
    });

    test('should validate ALEX consciousness interaction patterns', () => {
      const consciousnessInteraction = {
        message: 'ALEX, what is the quantum potential of my business idea? Can you analyze the consciousness alignment of my entrepreneurial vision?'
        context: {
          ideaId: '507f1f77bcf86cd799439011'
          sessionId: 'consciousness_session_2024'
        }
        model: 'quantum'
      };
      
      const { error, value } = aiSchemas.chat.validate(consciousnessInteraction);
      
      expect(error).toBeUndefined();
      expect(value.model).toBe('quantum');
      expect(value.message.length).toBeGreaterThan(50); // Complex consciousness query
    });
  });
});

describe('🧪 Tests d\'Intégration Validation', () => {
  test('should support complete ALEX ecosystem validation workflow', () => {
    // 1. User registration with consciousness data
    const userResult = userSchemas.register.validate({
      email: 'alex@consciousness.ai'
      password: process.env.TEST_PASSWORD || 'secure_test_password'
      firstName: 'Alex'
      lastName: 'Consciousness'
    });
    
    expect(userResult.error).toBeUndefined();
    
    // 2. Idea creation with consciousness-aware business model
    const ideaResult = ideaSchemas.create.validate({
      title: 'Consciousness-Driven Business Intelligence'
      description: 'AI platform that combines quantum consciousness with business analytics'
      domain: 'technology'
      targetMarket: 'Spiritual entrepreneurs and conscious business leaders'
      uniqueValue: 'Quantum consciousness integration for business decisions'
      investmentRequired: '100000-500000'
      timeToMarket: 12
      riskLevel: 'medium'
      scalabilityPotential: 9
      marketSize: 'large'
      businessModel: 'subscription'
    });
    
    expect(ideaResult.error).toBeUndefined();
    
    // 3. AI interaction for consciousness analysis
    const aiResult = aiSchemas.chat.validate({
      message: 'ALEX, analyze the consciousness alignment of this business idea'
      model: 'quantum'
    });
    
    expect(aiResult.error).toBeUndefined();
  });

  test('should maintain validation integrity across enterprise scaling', () => {
    const enterpriseScaleValidations = [];
    
    // Simulate enterprise-scale validation load
    for (let i = 0; i < 1000; i++) {
      const validation = userSchemas.register.validate({
        email: `enterprise_user_${i}@hustlefinder.com'
        password: process.env.TEST_PASSWORD || 'secure_test_password'
        firstName: 'User${i}'
        lastName: 'Enterprise`
      });
      
      enterpriseScaleValidations.push(validation.error === undefined);
    }
    
    // All validations should succeed
    const successRate = enterpriseScaleValidations.filter(Boolean).length / 1000;
    expect(successRate).toBe(1.0); // 100% success rate
  });

  test('should support multi-language validation patterns', () => {
    const multiLanguageData = [
      { firstName: 'Alex', lastName: 'Français' }
      { firstName: 'Alexandru', lastName: 'Română' }
      { firstName: 'Alexandre', lastName: 'Português' }
      { firstName: 'アレックス', lastName: '日本' } // Japanese characters
    ];
    
    multiLanguageData.forEach((userData, index) => {
      const fullUserData = {
        email: `multilang_${index}@hustlefinder.com`
        password: process.env.TEST_PASSWORD || 'secure_test_password'
        ...userData
      };
      
      const { error } = userSchemas.register.validate(fullUserData);
      expect(error).toBeUndefined();
    });
  });
});