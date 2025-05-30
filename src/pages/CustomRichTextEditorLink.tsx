import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';

type OptionProps = {
  onClick: (value: any) => void;
  children?: React.ReactNode;
  value?: string;
  className?: string;
  activeClassName?: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
};

/**
 * Source: https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/components/Option/index.js#L8
 */
const Option = ({
  onClick,
  children,
  value,
  className,
  activeClassName = '',
  active = false,
  disabled = false,
  title,
}: OptionProps) => (
  <div
    className={classNames('rdw-option-wrapper', className, {
      [`rdw-option-active ${activeClassName}`]: active,
      'rdw-option-disabled': disabled,
    })}
    onClick={() => {
      if (!disabled) {
        onClick(value);
      }
    }}
    aria-selected={active}
    title={title}
  >
    {children}
  </div>
);

/**
 * Source: https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/controls/Link/Component/index.js#L203
 */
const CustomRichTextEditorLink = ({
  config,
  currentState,
  doCollapse,
  expanded,
  onChange,
  onExpandEvent,
  translations,
}: CustomRichTextEditorLinkProps) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [linkTarget, setLinkTarget] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkTargetOption, setLinkTargetOption] = useState(
    config.defaultTargetOption,
  );

  useEffect(() => {
    if (!expanded) {
      setIsModalVisible(false);
      setLinkTarget('');
      setLinkTitle('');
      setLinkTargetOption(config.defaultTargetOption);
    }
  }, [expanded, config.defaultTargetOption]);

  const updateValue = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'linkTarget') {
      setLinkTarget(value);
    } else if (name === 'linkTitle') {
      setLinkTitle(value);
    }
  };

  const handleExpandModal = () => {
    onExpandEvent();
    setIsModalVisible(true);
    setLinkTarget(currentState.link?.target || '');
    setLinkTargetOption(currentState.link?.targetOption || linkTargetOption);
    setLinkTitle(currentState.link?.title || currentState.selectionText);
  };

  return (
    <div
      className={classNames('rdw-link-wrapper', config.className)}
      aria-label="rdw-link-control"
    >
      <Option
        value="unordered-list-item"
        className={classNames(config.link.className)}
        onClick={handleExpandModal}
        aria-haspopup="true"
        aria-expanded={isModalVisible}
        title={
          config.link.title || translations['components.controls.link.link']
        }
      >
        <img src={config.link.icon} alt="link-icon" />
      </Option>
      <Option
        disabled={!currentState.link}
        value="ordered-list-item"
        className={classNames(config.unlink.className)}
        onClick={() => onChange('unlink')}
        title={
          config.unlink.title || translations['components.controls.link.unlink']
        }
      >
        <img src={config.link.icon} alt="unlink-icon" />
      </Option>
      {expanded && isModalVisible && (
        <Stack
          spacing={4}
          className={classNames('rdw-link-modal', config.popupClassName)}
          onClick={(event) => event.stopPropagation()}
        >
          <FormElement
            id={'linkTitle'}
            label={t(
              'create.additionalInformation.description.editor.link_title',
            )}
            Component={
              <Input
                onChange={updateValue}
                onBlur={updateValue}
                name="linkTitle"
                value={linkTitle}
              />
            }
          />
          <FormElement
            id={'linkTarget'}
            label={t(
              'create.additionalInformation.description.editor.link_target',
            )}
            Component={
              <Input
                onChange={updateValue}
                onBlur={updateValue}
                name="linkTarget"
                value={linkTarget}
              />
            }
          />
          <Inline justifyContent={'center'} spacing={3}>
            <Button
              variant={ButtonVariants.PRIMARY}
              onClick={() =>
                onChange('link', linkTitle, linkTarget, linkTargetOption)
              }
              disabled={!linkTarget || !linkTitle}
            >
              {t('organizer.add_modal.actions.add')}
            </Button>
            <Button variant={ButtonVariants.SECONDARY} onClick={doCollapse}>
              {t('organizer.add_modal.actions.cancel')}
            </Button>
          </Inline>
        </Stack>
      )}
    </div>
  );
};

type CustomRichTextEditorLinkProps = {
  expanded?: boolean;
  doExpand?: () => void;
  doCollapse?: () => void;
  onExpandEvent?: () => void;
  config?: {
    link: any;
    unlink: any;
    popupClassName: string;
    defaultTargetOption?: string;
    className?: string;
  };
  onChange?: Function;
  currentState?: { link: any; selectionText: string };
  translations?: object;
};

export { CustomRichTextEditorLink };
