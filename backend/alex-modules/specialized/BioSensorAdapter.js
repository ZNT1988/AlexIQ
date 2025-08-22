/**
 * @fileoverview BioSensorAdapter - Adaptateur Capteurs Biométriques
 * @module BioSensorAdapter
 * @version 1.0.0
 */

import { EventEmitter } from "events";
import logger from "../config/logger.js";
/* eslint-disable no-undef */

/**
 * @class BioSensorAdapter
 * @description Adaptateur capteurs basé sur métriques système réelles
 */
export class BioSensorAdapter extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      strictMode: options.strictMode || true,
      sensorSensitivity: options.sensorSensitivity || 0.8
    };
    
    if (this.config.strictMode) {
      throw new Error("bio_sensor_adapter_not_implemented");
    }
    
    logger.info("🔬 BioSensorAdapter initialized - Anti-fake mode");
  }

  async readBioData(sensorType, context = {}) {
    if (this.config.strictMode) {
      throw new Error("bio_data_reading_not_implemented");
    }
    
    return {
      status: "not_implemented",
      data: {},
      timestamp: Date.now()
    };
  }

  getBioSensorStatus() {
    return {
      status: "not_implemented",
      initialized: true,
      sensorSensitivity: this.config.sensorSensitivity
    };
  }
}

export default BioSensorAdapter;