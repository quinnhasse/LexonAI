/**
 * Test harness for answerAgent
 *
 * This script tests the answerAgent function directly with sample questions
 * to verify OpenAI integration and answer generation is working correctly.
 *
 * Usage:
 *   npm run test:answer
 *
 * Or directly with tsx:
 *   npx tsx scripts/test-answer-agent.ts
 */

import { researchAgent } from '../src/services/researchAgent';
import { answerAgent } from '../src/services/answerAgent';
import { config } from '../src/config/env';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

/**
 * Test questions to validate answerAgent
 */
const testQuestions = [
  'What is Transparens AI?',
  'How does retrieval-augmented generation work?'
];

/**
 * Validates that an answer payload has all required fields
 */
function validateAnswer(answer: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!answer) {
    errors.push('Answer is null or undefined');
    return { valid: false, errors };
  }

  if (typeof answer.text !== 'string' || answer.text.trim().length === 0) {
    errors.push('Missing or empty text field');
  }

  if (!Array.isArray(answer.blocks)) {
    errors.push('blocks is not an array');
  } else if (answer.blocks.length === 0) {
    errors.push('blocks array is empty');
  } else {
    // Validate each block
    answer.blocks.forEach((block: any, index: number) => {
      if (!block.id || !block.id.startsWith('ans-')) {
        errors.push(`Block ${index + 1}: invalid id (${block.id})`);
      }
      if (block.type !== 'paragraph' && block.type !== 'bullet') {
        errors.push(`Block ${index + 1}: invalid type (${block.type})`);
      }
      if (typeof block.text !== 'string' || block.text.trim().length === 0) {
        errors.push(`Block ${index + 1}: missing or empty text`);
      }
      if (!Array.isArray(block.source_ids)) {
        errors.push(`Block ${index + 1}: source_ids is not an array`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates that all source_ids in answer blocks reference actual sources
 */
function validateSourceReferences(answer: any, validSourceIds: Set<string>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!answer.blocks) {
    return { valid: false, errors: ['No blocks to validate'] };
  }

  answer.blocks.forEach((block: any, index: number) => {
    if (Array.isArray(block.source_ids)) {
      block.source_ids.forEach((sourceId: string) => {
        if (!validSourceIds.has(sourceId)) {
          errors.push(`Block ${index + 1}: references invalid source_id "${sourceId}"`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Displays answer information
 */
function displayAnswer(answer: any) {
  console.log(`\n  ${colors.bright}Full Answer Text:${colors.reset}`);
  console.log(`  ${colors.blue}${answer.text}${colors.reset}\n`);

  console.log(`  ${colors.bright}Answer Blocks (${answer.blocks.length}):${colors.reset}`);
  answer.blocks.forEach((block: any, index: number) => {
    console.log(`\n    ${colors.magenta}[Block ${index + 1}]${colors.reset}`);
    console.log(`    ${colors.bright}ID:${colors.reset} ${block.id}`);
    console.log(`    ${colors.bright}Type:${colors.reset} ${block.type}`);
    console.log(`    ${colors.bright}Text:${colors.reset} ${block.text}`);
    console.log(`    ${colors.bright}Sources:${colors.reset} [${block.source_ids.join(', ')}]`);
  });
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`\n${colors.bright}${'='.repeat(60)}`);
  console.log('Answer Agent Test Harness');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  // Display configuration
  console.log(`${colors.yellow}Configuration:${colors.reset}`);
  console.log(`  EXA_API_KEY: ${config.exaApiKey ? colors.green + '✓ Set' + colors.reset : colors.red + '✗ Not set' + colors.reset}`);
  console.log(`  LLM_API_KEY: ${config.llmApiKey ? colors.green + '✓ Set' + colors.reset : colors.red + '✗ Not set' + colors.reset}`);
  console.log(`  Environment: ${config.nodeEnv}`);

  if (!config.exaApiKey) {
    console.log(`\n${colors.yellow}⚠ Warning: EXA_API_KEY not set. Tests will use stub sources.${colors.reset}`);
  }

  if (!config.llmApiKey) {
    console.log(`\n${colors.yellow}⚠ Warning: LLM_API_KEY not set. Tests will use fallback answers.${colors.reset}`);
    console.log(`${colors.yellow}To test real OpenAI integration, add LLM_API_KEY to your .env file.${colors.reset}\n`);
  }

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Run tests for each question
  for (const question of testQuestions) {
    console.log(`\n${colors.bright}${'-'.repeat(60)}`);
    console.log(`Test Question: "${question}"`);
    console.log(`${'-'.repeat(60)}${colors.reset}\n`);

    totalTests++;

    try {
      // Step 1: Get sources from research agent
      console.log(`${colors.blue}Step 1: Fetching sources from research agent...${colors.reset}`);
      const researchStartTime = Date.now();
      const sources = await researchAgent(question);
      const researchDuration = Date.now() - researchStartTime;

      console.log(`${colors.green}✓ Retrieved ${sources.length} sources in ${researchDuration}ms${colors.reset}`);

      // Display source IDs
      const sourceIds = sources.map(s => s.id);
      console.log(`${colors.blue}  Source IDs: [${sourceIds.join(', ')}]${colors.reset}\n`);

      // Step 2: Generate answer from sources
      console.log(`${colors.blue}Step 2: Generating answer using LLM...${colors.reset}`);
      const answerStartTime = Date.now();
      const answer = await answerAgent(question, sources);
      const answerDuration = Date.now() - answerStartTime;

      console.log(`${colors.green}✓ Answer generated in ${answerDuration}ms${colors.reset}`);

      // Step 3: Validate answer structure
      console.log(`\n${colors.blue}Step 3: Validating answer structure...${colors.reset}`);
      const structureValidation = validateAnswer(answer);

      if (!structureValidation.valid) {
        console.log(`${colors.red}✗ Answer structure validation failed:${colors.reset}`);
        structureValidation.errors.forEach(error => console.log(`    - ${error}`));
        failedTests++;
        continue;
      }

      console.log(`${colors.green}✓ Answer structure is valid${colors.reset}`);

      // Step 4: Validate source references
      console.log(`\n${colors.blue}Step 4: Validating source references...${colors.reset}`);
      const validSourceIds = new Set(sourceIds);
      const referenceValidation = validateSourceReferences(answer, validSourceIds);

      if (!referenceValidation.valid) {
        console.log(`${colors.yellow}⚠ Source reference validation warnings:${colors.reset}`);
        referenceValidation.errors.forEach(error => console.log(`    - ${error}`));
      } else {
        console.log(`${colors.green}✓ All source references are valid${colors.reset}`);
      }

      // Display answer
      displayAnswer(answer);

      // Step 5: Check grounding
      console.log(`\n${colors.blue}Step 5: Checking answer grounding...${colors.reset}`);
      const totalSourceCitations = answer.blocks.reduce((sum: number, block: any) =>
        sum + block.source_ids.length, 0
      );
      const avgCitationsPerBlock = (totalSourceCitations / answer.blocks.length).toFixed(2);

      console.log(`  ${colors.bright}Total source citations:${colors.reset} ${totalSourceCitations}`);
      console.log(`  ${colors.bright}Average citations per block:${colors.reset} ${avgCitationsPerBlock}`);

      if (totalSourceCitations === 0 && sources.length > 0) {
        console.log(`  ${colors.yellow}⚠ Warning: Answer has no source citations despite having sources${colors.reset}`);
      } else if (totalSourceCitations > 0) {
        console.log(`  ${colors.green}✓ Answer is grounded in sources${colors.reset}`);
      }

      // Test passed
      passedTests++;

    } catch (error) {
      console.log(`${colors.red}✗ Test failed with error:${colors.reset}`);
      console.error(error);
      failedTests++;
    }
  }

  // Summary
  console.log(`\n${colors.bright}${'='.repeat(60)}`);
  console.log('Test Summary');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`  ${failedTests > 0 ? colors.red : colors.reset}Failed: ${failedTests}${colors.reset}`);
  console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
