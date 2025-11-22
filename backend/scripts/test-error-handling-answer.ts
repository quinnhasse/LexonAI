/**
 * Test error handling for answerAgent
 *
 * This script tests various error scenarios to ensure the answer agent
 * handles failures gracefully and never crashes the system.
 */

import { answerAgent } from '../src/services/answerAgent';
import { Source } from '../src/types/shared';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

/**
 * Test scenarios
 */
const testScenarios = [
  {
    name: 'Empty sources array',
    question: 'What is AI?',
    sources: [],
    expectedBehavior: 'Should return fallback answer with empty source_ids'
  },
  {
    name: 'Single source',
    question: 'What is machine learning?',
    sources: [
      {
        id: 's1',
        title: 'Introduction to Machine Learning',
        url: 'https://example.com/ml',
        snippet: 'Machine learning is a subset of artificial intelligence.',
        score: 0.95
      }
    ],
    expectedBehavior: 'Should generate answer citing s1'
  },
  {
    name: 'Multiple sources with different quality',
    question: 'What is deep learning?',
    sources: [
      {
        id: 's1',
        title: 'Deep Learning Basics',
        url: 'https://example.com/dl1',
        snippet: 'Deep learning uses neural networks with multiple layers.',
        score: 0.95
      },
      {
        id: 's2',
        title: 'Neural Networks',
        url: 'https://example.com/dl2',
        snippet: 'Neural networks are inspired by biological neurons.',
        score: 0.85
      },
      {
        id: 's3',
        title: 'AI Overview',
        url: 'https://example.com/dl3',
        snippet: 'Artificial intelligence encompasses many techniques.',
        score: 0.60
      }
    ],
    expectedBehavior: 'Should generate answer with multiple blocks citing relevant sources'
  }
];

/**
 * Run error handling tests
 */
async function runTests() {
  console.log(`\n${colors.bright}${'='.repeat(60)}`);
  console.log('Answer Agent Error Handling Tests');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  let passedTests = 0;
  let failedTests = 0;

  for (const scenario of testScenarios) {
    console.log(`\n${colors.bright}${'-'.repeat(60)}`);
    console.log(`Test: ${scenario.name}`);
    console.log(`${'-'.repeat(60)}${colors.reset}`);
    console.log(`Question: "${scenario.question}"`);
    console.log(`Sources: ${scenario.sources.length}`);
    console.log(`Expected: ${scenario.expectedBehavior}\n`);

    try {
      const startTime = Date.now();
      const answer = await answerAgent(scenario.question, scenario.sources);
      const duration = Date.now() - startTime;

      // Validate result
      if (!answer || !answer.text || !Array.isArray(answer.blocks)) {
        console.log(`${colors.red}✗ FAIL: Invalid answer structure${colors.reset}`);
        failedTests++;
        continue;
      }

      if (answer.blocks.length === 0) {
        console.log(`${colors.red}✗ FAIL: No answer blocks generated${colors.reset}`);
        failedTests++;
        continue;
      }

      // Check source_ids validity
      const validSourceIds = new Set(scenario.sources.map(s => s.id));
      let hasInvalidRefs = false;

      for (const block of answer.blocks) {
        for (const sourceId of block.source_ids) {
          if (!validSourceIds.has(sourceId) && scenario.sources.length > 0) {
            console.log(`${colors.yellow}⚠ WARNING: Block ${block.id} references invalid source "${sourceId}"${colors.reset}`);
            hasInvalidRefs = true;
          }
        }
      }

      console.log(`${colors.green}✓ PASS: Generated valid answer${colors.reset}`);
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Blocks: ${answer.blocks.length}`);
      console.log(`  Text length: ${answer.text.length} chars`);

      if (scenario.sources.length === 0 && answer.blocks.some(b => b.source_ids.length > 0)) {
        console.log(`${colors.yellow}  ⚠ Note: Generated source_ids with no sources (fallback behavior)${colors.reset}`);
      }

      if (!hasInvalidRefs) {
        console.log(`${colors.green}  ✓ All source references are valid${colors.reset}`);
      }

      passedTests++;

    } catch (error) {
      console.log(`${colors.red}✗ FAIL: Unexpected error${colors.reset}`);
      console.error(error);
      failedTests++;
    }
  }

  // Summary
  console.log(`\n${colors.bright}${'='.repeat(60)}`);
  console.log('Test Summary');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
  console.log(`  Total Tests: ${testScenarios.length}`);
  console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`  ${failedTests > 0 ? colors.red : colors.reset}Failed: ${failedTests}${colors.reset}\n`);

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
