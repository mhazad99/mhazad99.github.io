// Everything you are likely to change lives in this file.
// After editing, commit and push — the site rebuilds by itself.

export default {
  // Your GitHub username. Projects are pulled from this account.
  githubUser: 'mhazad99',

  // Leave empty to use the name on your GitHub profile.
  name: 'Mohammad Hasan Azad',

  // One line under your name. Leave empty to use your GitHub bio.
  tagline: 'Software developer for sleep research at CEAMS, Hôpital du Sacré-Cœur de Montréal',
  fallbackTagline: 'Sleep research, biomedical signals and machine learning',

  // A short paragraph about you.
  bio: `I'm an electrical and biomedical engineer in Montréal with more than six
years of experience in software development, biomedical signal processing and
machine learning. At CEAMS I build the Snooz Toolbox, from algorithm design to the
interface, testing and cross-platform releases, and I work with researchers and
sleep labs on new analysis methods. My master's research at ÉTS used sleep EEG and
ECG to detect depression.`,

  // Links shown at the top. Remove a line to hide it; add your own.
  links: [
    { label: 'Email', url: 'mailto:mhazad1999@gmail.com' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/mohammad-hasan-azad/' },
    { label: 'GitHub', url: 'https://github.com/mhazad99' },
    // { label: 'CV (PDF)', url: '/cv.pdf' },   // put cv.pdf in the public folder
  ],

  // Repositories in other accounts that I commit to. The site shows how many
  // commits I made in each and when the last one was, updated every day.
  contributions: [
    'SnoozToolbox/snooz-package-ceams',
    'SnoozToolbox/snooz-toolbox',
    'SnoozToolbox/SnoozDoc',
    'SnoozToolbox/snooz_installers_public',
    'SnoozToolbox/harmonie_reader',
    'SnoozToolbox/snooz-package-template',
  ],

  // Names and email addresses I commit with. Used to count my commits on every
  // branch of the repositories above, not only the main branch.
  commitAuthors: [
    'Mohammad Hasan Azad',
    'mhazad1999@gmail.com',
    'mohammad-hasan.azad.1@ens.etsmtl.ca',
    'mhazad99@users.noreply.github.com',
    'mhazad@crhsc.local',
  ],

  // Which of my own GitHub repositories appear under "Other projects":
  // add this topic to a repo on GitHub and it shows up automatically.
  // Until at least one repo has the topic, all my own (non-fork) repos are shown.
  // Repos already linked in work.yaml or cv.yaml are not repeated there.
  portfolioTopic: 'portfolio',

  // Repositories to never show, by name.
  hide: [],
};
