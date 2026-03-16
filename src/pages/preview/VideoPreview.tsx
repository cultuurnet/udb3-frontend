import { useTranslation } from 'react-i18next';

import { VideoObject } from '@/types/Offer';
import { Link } from '@/ui/Link';
import { List } from '@/ui/List';

import { EmptyValue } from './EmptyValue';

type Props = {
  videos: VideoObject[];
};

const VideoPreview = ({ videos }: Props) => {
  // TODO check with Sarah if we need real previews here?
  // @see https://jira.publiq.be/browse/III-6951
  const { t } = useTranslation();
  const hasVideos = (videos ?? []).length > 0;

  if (!hasVideos)
    return <EmptyValue>{t('preview.empty_value.videos')}</EmptyValue>;

  return (
    <List
      css={`
        display: block;
      `}
    >
      {videos?.map((video) => (
        <List.Item
          key={video['@id']}
          css={`
            display: list-item;
            list-style-type: disc;
            margin-left: 20px;
          `}
        >
          <Link href={video.url} target="_blank">
            {video.url}
          </Link>
        </List.Item>
      ))}
    </List>
  );
};

export { VideoPreview };
