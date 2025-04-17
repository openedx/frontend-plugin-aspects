import * as React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { ArrowDropDown, ArrowDropUp, ChevronRight } from '@openedx/paragon/icons';
import { Block } from '../../hooks';
import messages from '../../messages';

interface CourseContentListProps {
  title: string,
  contentList?: Block[] | null,
  icon: React.FC,
  activateDashboard: (block: Block) => void,
}

export function CourseContentList({
  title, contentList, icon, activateDashboard,
}: CourseContentListProps) {
  const intl = useIntl();
  // using undefined is useful for slicing the list
  const [showCount, setShowCount] = React.useState<number | undefined>(5);

  if (!contentList?.length) {
    return null;
  }

  return (
    <div className="d-flex flex-column rounded-bottom py-4 px-3 bg-white border-top border-light">
      <h4 className="h4 mb-4">{title}</h4>
      {contentList?.slice(0, showCount).map(block => (
        <Button
          key={block.id}
          className="d-flex flex-row justify-content-start flex-grow-1 mb-2 py-1 px-0"
          variant="inline"
          onClick={() => activateDashboard(block)}
        >
          <h5 className="h5 flex-grow-1 text-left d-flex align-items-center">
            <Icon
              src={icon}
              size="xs"
              className="mr-2 text-gray"
              aria-hidden
            />
            <span>{block.displayName || block.name}</span>
          </h5>
          <Icon src={ChevronRight} aria-hidden />
        </Button>
      ))}
      {(contentList?.length > 5) && (
        <Button
          variant="tertiary"
          size="sm"
          iconAfter={showCount === 5 ? ArrowDropDown : ArrowDropUp}
          onClick={() => setShowCount(showCount === 5 ? undefined : 5)}
        >
          {showCount === 5 ? intl.formatMessage(messages.showMore) : intl.formatMessage(messages.showLess)}
        </Button>
      )}
    </div>
  );
}
