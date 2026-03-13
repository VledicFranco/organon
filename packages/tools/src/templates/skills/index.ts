/**
 * Skill templates index — all 5 distributable skills.
 */

import { ORGANON_FILE_CREATION_SKILL } from './organon-file-creation.js';
import { QUALITY_REVIEW_SKILL } from './quality-review.js';
import { VERIFY_AND_HEALTH_SKILL } from './verify-and-health.js';

export {
  ORGANON_FILE_CREATION_SKILL,
  QUALITY_REVIEW_SKILL,
  VERIFY_AND_HEALTH_SKILL,
};

/** Map of skill name → { path, content } for all distributable skills. */
export function getSkillTemplates(): Map<string, { path: string; content: string }> {
  const skills = new Map<string, { path: string; content: string }>();

  skills.set('organon-file-creation', {
    path: '.claude/skills/organon-file-creation/SKILL.md',
    content: ORGANON_FILE_CREATION_SKILL,
  });

  skills.set('quality-review', {
    path: '.claude/skills/quality-review/SKILL.md',
    content: QUALITY_REVIEW_SKILL,
  });

  skills.set('verify-and-health', {
    path: '.claude/skills/verify-and-health/SKILL.md',
    content: VERIFY_AND_HEALTH_SKILL,
  });

  return skills;
}
