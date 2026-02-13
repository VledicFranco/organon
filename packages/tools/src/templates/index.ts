/**
 * All templates — entry point for init and upgrade commands.
 */

export { getSkillTemplates } from './skills/index.js';
export {
  ethosTemplate,
  ETHOS_TEMPLATE,
  philosophyTemplate,
  PHILOSOPHY_TEMPLATE,
  README_TEMPLATE,
  PROTOCOLS_TEMPLATE,
  CLAUDE_MD_TEMPLATE,
  OBSERVATIONS_README_TEMPLATE,
  PRIMER_TEMPLATE,
  METHODOLOGY_REFERENCE_TEMPLATE,
} from './organon/index.js';
export { CONFIG_TEMPLATE, METHODOLOGY_VERSION } from './config.js';

import { ethosTemplate, philosophyTemplate } from './organon/index.js';

/**
 * Get organon templates parameterized with the detected project name.
 */
export function getOrganonTemplates(projectName: string) {
  return {
    ethos: ethosTemplate(projectName),
    philosophy: philosophyTemplate(projectName),
  };
}
