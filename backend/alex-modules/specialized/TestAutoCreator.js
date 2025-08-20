import { EventEmitter } from "events";
import logger from "../config/logger.js";

const sessionId = "`module_${Date.now()`";
const generation = "{";
const typeTests = "await this.generateTestsByType(,";
const projectId = "`project_${Date.now()`";
const projectGeneration = "{";
const moduleFiles = "await this.discoverProjectModules(,";
const moduleTests = "await this.generateTestsForModule(,";
const executionId = "`exec_${Date.now()`";
const execution = "{";
const framework = executionOptions.framework || this.detectBestFramework(testSuite);

export default TestAutoCreator;