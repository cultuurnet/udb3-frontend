import getConfig from 'next/config';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { useGetAnnouncements } from '@/hooks/api/announcements';
import { useGetEventsToModerate } from '@/hooks/api/events';
import { useGetPermissions, useGetRoles } from '@/hooks/api/user';
import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMatchBreakpoint } from '@/hooks/useMatchBreakpoint';
import type { Values } from '@/types/Values';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import type { ListProps } from '@/ui/List';
import { List } from '@/ui/List';
import { Logo, LogoVariants } from '@/ui/Logo';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { Breakpoints, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

import { Announcements, AnnouncementStatus } from './Announcements';
import { JobLogger, JobLoggerStates } from './joblogger/JobLogger';
import { JobLoggerStateIndicator } from './joblogger/JobLoggerStateIndicator';

const getValueForMenuItem = getValueFromTheme('menuItem');
const getValueForSidebar = getValueFromTheme('sidebar');
const getValueForMenu = getValueFromTheme('menu');

const PermissionTypes = {
  AANBOD_BEWERKEN: 'AANBOD_BEWERKEN',
  AANBOD_MODEREREN: 'AANBOD_MODEREREN',
  AANBOD_VERWIJDEREN: 'AANBOD_VERWIJDEREN',
  ORGANISATIES_BEWERKEN: 'ORGANISATIES_BEWERKEN',
  ORGANISATIES_BEHEREN: 'ORGANISATIES_BEHEREN',
  GEBRUIKERS_BEHEREN: 'GEBRUIKERS_BEHEREN',
  LABELS_BEHEREN: 'LABELS_BEHEREN',
  VOORZIENINGEN_BEWERKEN: 'VOORZIENINGEN_BEWERKEN',
  PRODUCTIES_AANMAKEN: 'PRODUCTIES_AANMAKEN',
  FILMS_AANMAKEN: 'FILMS_AANMAKEN',
} as const;

type MenuItemType = {
  href?: string;
  iconName: Values<typeof Icons>;
  suffix?: ReactNode;
  children: string;
  onClick?: () => void;
  visible?: boolean;
  permission?: Values<typeof PermissionTypes>;
};

type MenuItemProps = Omit<MenuItemType, 'permission'>;

const MenuItem = memo(
  ({
    href,
    iconName,
    suffix,
    children: label,
    onClick,
    visible = true,
  }: MenuItemProps) => {
    if (!visible) {
      return null;
    }

    const Component = href ? Link : Button;

    return (
      <List.Item>
        <Component
          width="100%"
          variant="unstyled"
          padding={2}
          href={href}
          iconName={iconName}
          suffix={suffix}
          onClick={onClick}
          backgroundColor={{
            default: 'none',
            hover: getValueForMenuItem('hover.backgroundColor'),
          }}
          spacing={{ default: 3, s: 0 }}
          stackOn={Breakpoints.S}
          customChildren
          title={label}
        >
          <Text
            flex={1}
            css={`
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `}
            fontSize={{ s: '9px' }}
            textAlign={{ default: 'left', s: 'center' }}
          >
            {label}
          </Text>
        </Component>
      </List.Item>
    );
  },
);

MenuItem.displayName = 'MenuItem';

type MenuProps = ListProps & {
  items: MenuItemType[];
  title?: string;
};

const Menu = memo(({ items = [], title, ...props }: MenuProps) => {
  const Content = (contentProps) => (
    <List {...contentProps}>
      {items.map((menuItem, index) => (
        <MenuItem key={index} {...menuItem} />
      ))}
    </List>
  );

  Menu.displayName = 'Menu';

  if (!title) return <Content {...props} />;

  return (
    <Stack spacing={3} {...props}>
      <Title
        opacity={0.5}
        css={`
          font-size: 13px;
          font-weight: 400;
          text-transform: uppercase;
        `}
        textAlign={{ s: 'center' }}
      >
        {title}
      </Title>
      <Content />
    </Stack>
  );
});

type ProfileMenuProps = {
  profileImage?: string;
};

const ProfileMenu = ({ profileImage }: ProfileMenuProps) => {
  const { t } = useTranslation();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'user',
  ]);
  const { publicRuntimeConfig } = getConfig();

  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMenu = [
    {
      iconName: Icons.SIGN_OUT,
      children: t('menu.logout'),
      onClick: async () => {
        removeAuthenticationCookies();
        await queryClient.invalidateQueries('user');

        const getBaseUrl = () =>
          `${window.location.protocol}//${window.location.host}`;

        const queryString = new URLSearchParams({
          destination: getBaseUrl(),
        }).toString();

        router.push(`${publicRuntimeConfig.authUrl}/logout?${queryString}`);
      },
    },
  ];

  return (
    <Inline
      padding={1}
      spacing={2}
      alignItems="center"
      justifyContent="center"
      css={`
        border-top: 1px solid ${getValueForMenu('borderColor')};
      `}
    >
      <Image src={profileImage} width={50} height={50} alt="Profile picture" />
      <Stack as="div" padding={2} spacing={2} flex={1} display={{ s: 'none' }}>
        <Text>{cookies?.user?.username ?? ''}</Text>
        <Menu items={loginMenu} />
      </Stack>
    </Inline>
  );
};

ProfileMenu.defaultProps = {
  profileImage: '/assets/avatar.svg',
};

type NotificationMenuProps = {
  countUnseenAnnouncements: number;
  onClickAnnouncementsButton: () => void;
  onClickJobLoggerButton: () => void;
  jobLoggerState: Values<typeof JobLoggerStates>;
};

const NotificationMenu = memo(
  ({
    countUnseenAnnouncements,
    onClickAnnouncementsButton,
    onClickJobLoggerButton,
    jobLoggerState,
  }: NotificationMenuProps) => {
    const { t, i18n } = useTranslation();

    const notificationMenu = [
      {
        iconName: Icons.GIFT,
        children: t('menu.announcements'),
        suffix: countUnseenAnnouncements > 0 && (
          <Badge>{countUnseenAnnouncements}</Badge>
        ),
        onClick: onClickAnnouncementsButton,
        visible: i18n.language === 'nl',
      },
      {
        iconName: Icons.BELL,
        children: t('menu.notifications'),
        suffix: <JobLoggerStateIndicator state={jobLoggerState} />,
        onClick: onClickJobLoggerButton,
      },
    ];

    return <Menu items={notificationMenu} />;
  },
);

const Sidebar = () => {
  const { t, i18n } = useTranslation();

  const [isReactCreateFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.REACT_CREATE,
  );

  const storage = useLocalStorage();

  const [isJobLoggerVisible, setIsJobLoggerVisible] = useState(true);
  const [jobLoggerState, setJobLoggerState] = useState(JobLoggerStates.IDLE);
  const sidebarComponent = useRef();

  const [
    isAnnouncementsModalVisible,
    setIsAnnouncementsModalVisible,
  ] = useState(false);
  const [activeAnnouncementId, setActiveAnnouncementId] = useState();

  const [searchQuery, setSearchQuery] = useState('');

  const getAnnouncementsQuery = useGetAnnouncements({
    refetchInterval: 60000,
  });

  const rawAnnouncements = getAnnouncementsQuery.data?.data ?? [];
  const getPermissionsQuery = useGetPermissions();
  const getRolesQuery = useGetRoles();
  const getEventsToModerateQuery = useGetEventsToModerate(searchQuery);
  // @ts-expect-error
  const countEventsToModerate = getEventsToModerateQuery.data?.totalItems || 0;

  const isSmallView = useMatchBreakpoint(Breakpoints.S);

  const handleClickAnnouncement = useCallback(
    (activeAnnouncement) => setActiveAnnouncementId(activeAnnouncement.uid),
    [],
  );

  const toggleIsAnnouncementsModalVisible = useCallback(
    () => setIsAnnouncementsModalVisible((prevValue) => !prevValue),
    [],
  );

  const toggleIsJobLoggerVisible = useCallback(
    () => setIsJobLoggerVisible((prevValue) => !prevValue),
    [],
  );

  useEffect(() => {
    if (isAnnouncementsModalVisible) {
      setActiveAnnouncementId(announcements[0].uid);
    }
  }, [isAnnouncementsModalVisible]);

  useEffect(() => {
    if (activeAnnouncementId) {
      const seenAnnouncements = storage.getItem('seenAnnouncements') ?? [];
      if (!seenAnnouncements.includes(activeAnnouncementId)) {
        storage.setItem('seenAnnouncements', [
          ...seenAnnouncements,
          activeAnnouncementId,
        ]);
      }
    }
  }, [activeAnnouncementId]);

  useEffect(() => {
    if (rawAnnouncements.length === 0) {
      return;
    }

    const seenAnnouncements = storage.getItem('seenAnnouncements') ?? [];
    const cleanedUpSeenAnnouncements = seenAnnouncements.filter(
      (seenAnnouncementId) =>
        rawAnnouncements.find(
          (announcement) => announcement.uid === seenAnnouncementId,
        ),
    );
    storage.setItem('seenAnnouncements', cleanedUpSeenAnnouncements);
  }, [rawAnnouncements]);

  useEffect(() => {
    // @ts-expect-error
    if (!getRolesQuery.data) {
      return;
    }

    // @ts-expect-error
    const validationQuery = getRolesQuery.data
      .map((role) => (role.constraints?.v3 ? role.constraints.v3 : null))
      .filter((constraint) => constraint !== null)
      .join(' OR ');

    setSearchQuery(validationQuery);
    // @ts-expect-error
  }, [getRolesQuery.data]);

  const announcements = useMemo(
    () =>
      rawAnnouncements.map((announcement) => {
        if (activeAnnouncementId === announcement.uid) {
          return { ...announcement, status: AnnouncementStatus.ACTIVE };
        }
        const seenAnnouncements = storage.getItem('seenAnnouncements') ?? [];
        if (seenAnnouncements.includes(announcement.uid)) {
          return { ...announcement, status: AnnouncementStatus.SEEN };
        }
        return { ...announcement, status: AnnouncementStatus.UNSEEN };
      }),
    [rawAnnouncements, activeAnnouncementId],
  );

  const countUnseenAnnouncements = useMemo(
    () =>
      announcements.filter(
        (announcement) => announcement.status === AnnouncementStatus.UNSEEN,
      ).length,
    [announcements],
  );

  const userMenu = [
    {
      href: '/dashboard?tab=events&page=1',
      iconName: Icons.HOME,
      children: t('menu.home'),
    },
    {
      href: isReactCreateFeatureFlagEnabled ? '/create' : '/event',
      iconName: Icons.PLUS_CIRCLE,
      children: t('menu.add'),
    },
    {
      href: '/search',
      iconName: Icons.SEARCH,
      children: t('menu.search'),
    },
  ];

  const manageMenu: MenuItemType[] = [
    {
      permission: PermissionTypes.AANBOD_MODEREREN,
      href: '/manage/moderation/overview',
      iconName: Icons.FLAG,
      children: t('menu.validate'),
      suffix: countEventsToModerate > 0 && (
        <Badge>{countEventsToModerate}</Badge>
      ),
    },
    {
      permission: PermissionTypes.GEBRUIKERS_BEHEREN,
      href: '/manage/users/overview',
      iconName: Icons.USER,
      children: t('menu.users'),
    },
    {
      permission: PermissionTypes.GEBRUIKERS_BEHEREN,
      href: '/manage/roles/overview',
      iconName: Icons.USERS,
      children: t('menu.roles'),
    },
    {
      permission: PermissionTypes.LABELS_BEHEREN,
      href: '/manage/labels/overview',
      iconName: Icons.TAG,
      children: t('menu.labels'),
    },
    {
      permission: PermissionTypes.ORGANISATIES_BEHEREN,
      href: '/manage/organizations',
      iconName: Icons.SLIDE_SHARE,
      children: t('menu.organizations'),
    },
    {
      permission: PermissionTypes.PRODUCTIES_AANMAKEN,
      href: '/manage/productions',
      iconName: Icons.LAYER_GROUP,
      children: t('menu.productions'),
    },
    {
      permission: PermissionTypes.FILMS_AANMAKEN,
      href: '/manage/movies/create',
      iconName: Icons.VIDEO,
      children: t('menu.movies'),
      visible: i18n.language === 'nl',
    },
  ];

  const filteredManageMenu = useMemo(() => {
    // @ts-expect-error
    if (!getPermissionsQuery.data) {
      return [];
    }

    return manageMenu.filter((menuItem) => {
      // @ts-expect-error
      return getPermissionsQuery.data.includes(menuItem.permission);
    });
    // @ts-expect-error
  }, [getPermissionsQuery.data]);

  return [
    <Stack
      key="sidebar"
      forwardedAs="nav"
      height="100%"
      css={`
        overflow: hidden;
      `}
      width={{ default: '230px', s: '65px' }}
      backgroundColor={getValueForSidebar('backgroundColor')}
      color={getValueForSidebar('color')}
      zIndex={getValueForSidebar('zIndex')}
      padding={{ default: 2, s: 0 }}
      spacing={3}
      ref={sidebarComponent}
      onMouseOver={() => {
        setTimeout(() => {
          if (!sidebarComponent?.current) return;
          if (document.activeElement.tagName !== 'iframe') return;
          // @ts-expect-error
          document.activeElement.blur();
        }, 100);
      }}
    >
      <Link
        justifyContent="center"
        href="/dashboard"
        title={t('menu.home')}
        customChildren
      >
        <Logo
          variant={isSmallView ? LogoVariants.MOBILE : LogoVariants.DEFAULT}
        />
      </Link>
      <Stack
        paddingTop={4}
        spacing={4}
        flex={1}
        css={`
          > :not(:first-child) {
            border-top: 1px solid ${getValueForMenu('borderColor')};
          }
        `}
      >
        <Menu items={userMenu} />
        <Stack
          justifyContent={
            filteredManageMenu.length > 0 ? 'space-between' : 'flex-end'
          }
          flex={1}
        >
          {filteredManageMenu.length > 0 && (
            <Menu items={filteredManageMenu} title={t('menu.management')} />
          )}
          <Stack>
            <NotificationMenu
              countUnseenAnnouncements={countUnseenAnnouncements}
              jobLoggerState={jobLoggerState}
              onClickAnnouncementsButton={toggleIsAnnouncementsModalVisible}
              onClickJobLoggerButton={toggleIsJobLoggerVisible}
            />
            <ProfileMenu />
          </Stack>
        </Stack>
      </Stack>
    </Stack>,
    <JobLogger
      key="joblogger"
      visible={isJobLoggerVisible}
      onClose={() => setIsJobLoggerVisible((oldState) => !oldState)}
      onStatusChange={setJobLoggerState}
    />,
    <Announcements
      key="announcements"
      visible={isAnnouncementsModalVisible}
      announcements={announcements || []}
      onClickAnnouncement={handleClickAnnouncement}
      onClose={toggleIsAnnouncementsModalVisible}
    />,
  ];
};

export { Sidebar };
