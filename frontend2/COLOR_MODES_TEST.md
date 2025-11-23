# Color Modes - Visual Test Guide

## How to Test

1. Start the development server: `npm run dev`
2. Submit a question to generate a graph
3. Open the Controls Panel (top-right)
4. Switch to the "Colors" tab
5. Click each color mode and observe the changes

## Expected Behavior

### White Mode
**What you should see:**
- All nodes in monochrome palette (whites and grays)
- `question`: White (#ffffff)
- `answer_root`: Yellow (#ffff00)
- `answer_block`: Light grey (#b0b0b0)
- `direct_source`: Medium grey (#808080)
- `secondary_source`: Dark grey (#505050)

### By Level Mode
**What you should see:**
- Nodes colored by their layer depth (metadata.layer)
- Layer 1: Cyan (#22d3ee)
- Layer 2: Purple (#8b5cf6)
- Layer 3: Green (#10b981)
- Layer 4+: Pink (#ec4899)

**Mapping:**
- `answer_block` nodes (layer 1) → Cyan
- `direct_source` nodes (layer 2) → Purple
- `secondary_source` nodes (layer 3) → Green

### By Role Mode
**What you should see:**
- Nodes colored by their type/role
- `question` → Cyan (#22d3ee)
- `answer_root` → Green (#10b981)
- `answer_block` → Purple (#8b5cf6)
- `direct_source` → Green (#10b981)
- `secondary_source` → Pink (#ec4899)

## Bug Fix Summary

**Issue:** Color modes were not affecting node colors in the 3D visualization.

**Root Cause:**
- The `nodeColor` variable was being computed correctly in `Node.tsx:78-83`
- BUT it was never applied to any mesh materials
- All materials had hard-coded colors (#808080 for wireframe, #ffffff for glow)

**Fix:**
- Updated wireframe material at `Node.tsx:157` to use `color={nodeColor}`
- Updated glow effect material at `Node.tsx:169` to use `color={nodeColor}`
- Added `transparent` prop to wireframe material for proper opacity handling

**Files Changed:**
- `frontend2/src/components/Node.tsx` (lines 157-161 and 169-173)

**Verification:**
- TypeScript build passes: ✓
- No runtime errors: ✓
- Color modes now visually distinct: (requires manual testing)
