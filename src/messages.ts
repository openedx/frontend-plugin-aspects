import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  analyticsLabel: {
    id: 'aspects.label',
    defaultMessage: 'Analytics',
    description: 'Label for the analytics buttons on the course outline and unit header etc.',
  },
  closeButtonLabel: {
    id: 'aspects.button.close.alt',
    defaultMessage: 'Close',
    description: 'Label for the close icon button in the sidebar.',
  },
  backButtonLabel: {
    id: 'aspects.button.back.alt',
    defaultMessage: 'Back',
    description: 'Label for the back icon button in the sidebar.',
  },
  gradedSubsectionAnalytics: {
    id: 'aspects.title.graded-analytics',
    defaultMessage: 'Graded Subsection Analytics',
    description: 'Title for card showing list of graded subsections for analytics.',
  },
  videoAnalytics: {
    id: 'aspects.title.video-analytics',
    defaultMessage: 'Video Analytics',
    description: 'Title for card showing list of video blocks for analytics.',
  },
  problemAnalytics: {
    id: 'aspects.title.problem-analytics',
    defaultMessage: 'Problem Analytics',
    description: 'Title for card showing list of problem blocks for analytics.',
  },
  showMore: {
    id: 'aspects.button.show-more',
    defaultMessage: 'Show more',
    description: 'Label for the button that can expand a list of limited items to reveal all items.',
  },
  showLess: {
    id: 'aspects.button.show-less',
    defaultMessage: 'Show less',
    description: 'Label for the button that can hide items in a list and show limited items.',
  },
});

export default messages;
