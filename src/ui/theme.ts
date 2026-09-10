import get from 'lodash/get';

import type { Values } from '@/types/Values';

const colors = {
  primary: 'var(--primary)',
  neutral: 'var(--neutral)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  successMuted: 'var(--success-muted)',
  udbMainBlue: 'var(--brand)',
  brandAccessible: 'var(--brand-accessible)',
  udbMainMediumBlue: 'var(--accent)',
  udbMainLightBlue: 'var(--accent-subtle)',
  udbMainLightGrey: 'var(--border-strong)',
  udbMainPositiveGreen: 'var(--success)',
  white: 'var(--white)',
  greylight: 'var(--panel-bg)',
  grey1: 'var(--fill)',
  grey2: 'var(--border-input)',
  grey3: 'var(--border)',
  grey4: 'var(--fill-hover)',
  pink1: 'var(--danger-subtle)',
  red4: 'var(--danger-active)',
  orange: 'var(--orange)',
  warning: 'var(--warning)',
  warningIcon: 'var(--warning-icon)',
  info: 'var(--info)',
  danger: 'var(--danger)',
  dangerDark: 'var(--danger-hover)',
} as const;

const Breakpoints = {
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl',
} as const;

// z-index utils
const base = 0;
const above = 1;

const zIndexPaginationPageLink = above + base;

const zIndexDatePickerInput = above + zIndexPaginationPageLink;
const zIndexDatePickerButton = above + zIndexDatePickerInput;

const zIndexSidebar = above + zIndexDatePickerButton;
const zIndexPageFooter = zIndexSidebar;

const zIndexDatePickerPopup = above + zIndexSidebar;
const zIndexJobLogger = above + zIndexSidebar;
const zIndexToast = zIndexJobLogger;

const zIndexModalBackdrop = above + zIndexToast;

const zIndexModal = above + zIndexModalBackdrop;

const zIndexTimePickerPopup = above + zIndexModal;
//

type BreakpointValues = Values<typeof Breakpoints>;

const getGlobalBorderRadius = (props: { theme: Theme }) =>
  props.theme.borderRadius;

const getGlobalFormInputHeight = (props: { theme: Theme }) =>
  props.theme.formInputHeight;

const theme = {
  colors,
  breakpoints: {
    [Breakpoints.XS]: 575,
    [Breakpoints.S]: 768,
    [Breakpoints.M]: 992,
    [Breakpoints.L]: 1200,
    [Breakpoints.XL]: 1600,
  },
  borderRadius: '8px',
  formInputHeight: 'calc(1.5rem + 0.9rem + 2px)',
  components: {
    alert: {
      borderRadius: '8px',
      backgroundColor: {
        primary: 'var(--info-muted)',
        success: 'var(--success-muted)',
        warning: 'var(--warning-muted)',
        danger: 'var(--danger-muted)',
      },
      borderColor: {
        primary: colors.info,
        success: colors.udbMainPositiveGreen,
        warning: colors.warningIcon,
        danger: colors.danger,
      },
    },
    toast: {
      zIndex: zIndexToast,
      textColor: {
        dark: colors.text,
        light: colors.white,
      },
      primary: {
        backgroundColor: colors.primary,
        borderColor: 'var(--primary-active)',
      },
      secondary: {
        color: 'var(--text)',
        backgroundColor: colors.white,
      },
      success: {
        borderColor: colors.udbMainPositiveGreen,
      },
      danger: {
        borderColor: colors.danger,
      },
    },
    modal: {
      zIndex: zIndexModal,
      zIndexBackdrop: zIndexModalBackdrop,
    },
    datePicker: {
      zIndexInput: zIndexDatePickerInput,
      zIndexButton: zIndexDatePickerButton,
      zIndexPopup: zIndexDatePickerPopup,
    },
    timePicker: {
      zIndexPopup: zIndexTimePickerPopup,
    },
    link: {
      color: colors.primary,
      hoverColor: 'var(--primary-hover)',
    },
    badge: {
      color: colors.white,
      backgroundColor: colors.danger,
    },
    button: {
      borderRadius: '8px',
      paddingX: '0.9rem',
      paddingY: '0.5rem',
      boxShadow: {
        small: 'var(--elevation-sm)',
        large: 'var(--elevation-lg)',
      },
      primary: {
        backgroundColor: colors.primary,
        borderColor: 'var(--primary-active)',
        hoverBackgroundColor: 'var(--primary-hover)',
        hoverBorderColor: 'var(--primary-active)',
        activeBackgroundColor: 'var(--primary-active)',
        activeBorderColor: 'var(--primary-active)',
      },
      secondary: {
        color: 'var(--text)',
        backgroundColor: colors.white,
        hoverBackgroundColor: 'var(--fill-active)',
        hoverBorderColor: 'var(--border-strong)',
        activeColor: 'var(--text)',
        activeBackgroundColor: 'var(--fill-active)',
        activeBorderColor: 'var(--border-strong)',
      },
      secondaryToggle: {
        color: 'var(--text)',
        borderColor: 'var(--border-emphasis)',
        hoverBorderColor: colors.udbMainPositiveGreen,
        activeColor: colors.udbMainPositiveGreen,
        activeBorderColor: colors.udbMainPositiveGreen,
        activeBackgroundColor: colors.successMuted,
      },
      secondaryOutline: {
        color: colors.primary,
        borderColor: colors.primary,
        backgroundColor: colors.white,
        hoverBackgroundColor: 'var(--accent)',
        hoverBorderColor: 'var(--primary-hover)',
        activeColor: 'var(--text)',
        activeBackgroundColor: 'var(--fill-active)',
        activeBorderColor: 'var(--border-strong)',
      },
      success: {
        color: colors.white,
        borderColor: colors.udbMainPositiveGreen,
        hoverBackgroundColor: 'var(--success-hover)',
        hoverBorderColor: colors.udbMainPositiveGreen,
        backgroundColor: colors.udbMainPositiveGreen,
      },
      danger: {
        color: colors.white,
        borderColor: colors.danger,
        hoverBackgroundColor: colors.dangerDark,
        hoverBorderColor: colors.red4,
        backgroundColor: colors.danger,
      },
      icon: {
        hoverBackgroundColor: colors.grey4,
        focusBackgroundColor: colors.grey3,
      },
    },
    card: {
      boxShadow: {
        small: 'var(--elevation-sm)',
        medium: 'var(--elevation-md)',
        large: 'var(--elevation-lg)',
      },
    },
    global: {
      successColor: colors.udbMainPositiveGreen,
      warningIcon: colors.orange,
      boxShadow: {
        medium: 'var(--elevation-md)',
        heavy: 'var(--elevation-heavy)',
      },
    },
    pagination: {
      color: colors.text,
      activeBackgroundColor: colors.primary,
      activeBorderColor: colors.primary,
      activeColor: colors.white,
      hoverBackgroundColor: 'var(--primary-hover)',
      hoverBorderColor: 'var(--primary-hover)',
      hoverColor: colors.white,
      borderColor: colors.grey2,
      focusBoxShadow: 'none',
      paddingX: '0.84rem',
      paddingY: '0.3rem',
      pageLink: {
        zIndex: zIndexPaginationPageLink,
      },
    },
    typeahead: {
      active: {
        color: colors.text,
        backgroundColor: colors.udbMainMediumBlue,
      },
      hover: {
        color: colors.text,
        backgroundColor: 'var(--primary-subtle)',
      },
      highlight: {
        fontWeight: 'bold',
        backgroundColor: 'transparent',
      },
    },
    page: {
      backgroundColor: 'var(--page-bg)',
      borderColor: colors.grey3,
    },
    pageTitle: {
      color: colors.text,
      borderColor: colors.grey2,
    },
    pageFooter: {
      zIndex: zIndexPageFooter,
    },
    title: {
      color: colors.text,
      borderColor: colors.grey2,
    },
    panel: {
      borderColor: colors.grey3,
    },
    panelFooter: {
      borderColor: colors.grey3,
      backgroundColor: colors.grey4,
    },
    listItem: {
      backgroundColor: colors.white,
    },
    spinner: {
      primary: {
        color: colors.primary,
      },
      light: {
        color: colors.white,
      },
    },
    sidebar: {
      zIndex: zIndexSidebar,
      color: 'var(--sidebar-text)',
      logoColor: colors.udbMainBlue,
      backgroundColor: 'var(--sidebar-bg)',
      borderColor: 'var(--sidebar-border)',
    },
    jobLogger: {
      zIndex: zIndexJobLogger,
    },
    menu: {
      borderColor: colors.udbMainLightGrey,
    },
    menuItem: {
      active: {
        color: 'var(--sidebar-active)',
        indicatorColor: 'var(--sidebar-indicator)',
      },
      hover: {
        backgroundColor: 'var(--sidebar-hover)',
        color: 'var(--sidebar-hover-text)',
      },
    },
    announcement: {
      borderColor: colors.grey2,
      hoverBackgroundColor: colors.grey1,
      selected: {
        backgroundColor: colors.udbMainMediumBlue,
        hoverBackgroundColor: colors.udbMainMediumBlue,
      },
    },
    announcementList: {
      borderColor: colors.grey2,
    },
    announcementContent: {
      linkColor: colors.primary,
    },
    jobStatusIcon: {
      backgroundColor: colors.white,
      warning: {
        circleFillColor: colors.danger,
        remarkFillColor: colors.white,
      },
      busy: {
        spinnerStrokeColor: colors.primary,
        backgroundColor: colors.white,
      },
      complete: {
        checkFillColor: colors.successMuted,
      },
    },
    productionItem: {
      borderColor: colors.grey3,
      activeColor: colors.white,
      backgroundColor: colors.white,
      activeBackgroundColor: colors.primary,
    },
    eventItem: {
      borderColor: colors.grey3,
    },
    newFeatureTooltip: {
      backgroundColor: colors.textMuted,
    },
    detailTable: {
      backgroundColor: colors.grey1,
      borderColor: colors.grey3,
    },
    loginPage: {
      backgroundColor: colors.white,
      footer: {
        backgroundColor: colors.white,
        linkColor: colors.neutral,
      },
    },
    pageNotFound: {
      iconColor: colors.grey2,
    },
    pageError: {
      iconColor: colors.danger,
    },
    selectionTable: {
      color: colors.textMuted,
      borderColor: colors.grey3,
    },
    dashboardPage: {
      listItem: {
        backgroundColor: colors.white,
        borderColor: colors.grey3,
        color: 'var(--primary)',
        passedEvent: {
          color: colors.textMuted,
        },
      },
    },
    createPage: {
      title: {
        color: colors.text,
        borderColor: colors.grey2,
      },
      stepNumber: {
        backgroundColor: colors.neutral,
      },
      footer: {
        color: colors.text,
      },
    },
    tabs: {
      color: 'var(--primary)',
      hoverColor: colors.text,
      borderColor: colors.grey3,
      activeTabColor: colors.textMuted,
      activeTabBackgroundColor: colors.grey1,
      hoverTabBackgroundColor: 'var(--fill-active)',
      borderRadius: '8px',
    },
    pictureUploadBox: {
      backgroundColor: colors.white,
      borderColor: colors.grey2,
      errorBorderColor: colors.danger,
      imageIconColor: 'pink',
      imageBackgroundColor: colors.grey1,
      mainImageBackgroundColor: colors.udbMainLightBlue,
    },
    ageRange: {
      rangeTextColor: colors.textMuted,
    },
    priceInformation: {
      borderColor: colors.grey3,
      iconColor: colors.textMuted,
    },
    contactInformation: {
      borderColor: colors.grey3,
      iconColor: colors.grey2,
      iconColorHover: colors.textMuted,
      errorText: colors.danger,
    },
    videoUploadBox: {
      backgroundColor: colors.white,
      borderColor: colors.grey2,
      errorBorderColor: colors.danger,
      imageIconColor: colors.textMuted,
      imageBackgroundColor: colors.grey1,
      mainImageBackgroundColor: colors.udbMainLightBlue,
    },
    toggleBox: {
      backgroundColor: colors.white,
      activeBackgroundColor: colors.successMuted,
      activeBorderColor: colors.udbMainPositiveGreen,
      borderColor: 'var(--border-emphasis)',
      textColor: colors.neutral,
      activeTextColor: colors.text,
      iconColor: colors.textMuted,
      iconCheckColor: colors.udbMainPositiveGreen,
      boxShadow: {
        small: 'var(--elevation-sm)',
        large: 'var(--elevation-lg)',
      },
      hoverBorderColor: colors.udbMainPositiveGreen,
    },
    dropdown: {
      activeToggleBoxShadow: 'inset 0 3px 5px rgba(0, 0, 0, 0.125)',
    },
    text: {
      muted: {
        color: colors.textMuted,
      },
      error: {
        color: colors.danger,
      },
    },
    organizerAddModal: {
      address: {
        borderColor: colors.grey3,
      },
    },
    openingHoursModal: {
      fontSize: {
        modalTitle: '1.25rem',
        accordionTitle: '1.125rem',
        sectionTitle: '1.067rem',
      },
    },
    offerScore: {
      link: colors.text,
    },
    richTextEditor: {
      borderColor: colors.grey1,
    },
  },
} as const;

type Theme = typeof theme;

const getValueFromTheme =
  (component: string) => (path: string) => (props: { theme: Theme }) =>
    get(props.theme, `components.${component}.${path}`);

export {
  Breakpoints,
  colors,
  getGlobalBorderRadius,
  getGlobalFormInputHeight,
  getValueFromTheme,
  theme,
};
export type { BreakpointValues, Theme };
