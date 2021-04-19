import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Stack' or its correspondi... Remove this comment to see the full error message
import { getStackProps, Stack, stackPropTypes } from '@/ui/Stack';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Title' or its correspondi... Remove this comment to see the full error message
import { Title } from '@/ui/Title';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/List' or its correspondin... Remove this comment to see the full error message
import { List } from '@/ui/List';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/theme' or its correspondi... Remove this comment to see the full error message
import { getValueFromTheme } from '@/ui/theme';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Panel' or its correspondi... Remove this comment to see the full error message
import { Panel } from '@/ui/Panel';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Spinner' or its correspon... Remove this comment to see the full error message
import { Spinner } from '@/ui/Spinner';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Pagination' or its corres... Remove this comment to see the full error message
import { Pagination } from '@/ui/Pagination';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Box' or its corresponding... Remove this comment to see the full error message
import { parseSpacing } from '@/ui/Box';

const getValue = getValueFromTheme('productionItem');

const Productions = ({
  productions,
  currentPage,
  totalItems,
  perPage,
  onClickProduction,
  onChangePage,
  className,
  loading,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'spacing'.
    <Stack className={className} spacing={4} {...getStackProps(props)}>
      // @ts-expect-error ts-migrate(2695) FIXME: Left side of comma operator is unused and has no s... Remove this comment to see the full error message
      {loading ? (
        <Spinner marginTop={4} />
      ) : (
        [
          <Title key="title" minHeight={parseSpacing(5)()}>
            {t('productions.overview.production')}
          </Title>,
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'key'.
          <Panel key="panel">
            <List>
              {productions.map((production, index) => (
                <List.Item
                  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'paddingLeft'.
                  paddingLeft={4}
                  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'paddingRight'.
                  paddingRight={4}
                  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'paddingBottom'.
                  paddingBottom={3}
                  paddingTop={3}
                  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'paddingTop'.
                  color={production.active && getValue('activeColor')}
                  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'backgroundColor'.
                  backgroundColor={
                    // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
                    production.active
                      ? getValue('activeBackgroundColor')
                      : getValue('backgroundColor')
                  }
                  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cursor'.
                  cursor="pointer"
                  css={
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'css'.
                    index !== productions.length - 1
                      ? (props) => {
                          return `border-bottom: 1px solid ${getValue(
                            'borderColor',
                          )(props)};`;
                        }
                      : undefined
                  }
                  key={production.id}
                  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'key'.
                  onClick={() => onClickProduction(production.id)}
                // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'production'. Did you mean 'Produ... Remove this comment to see the full error message
                >
                  // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
                  {production.name}
                // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'production'. Did you mean 'Produ... Remove this comment to see the full error message
                </List.Item>
              ))}
            </List>
            <Panel.Footer>
              <Pagination
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'currentPage'.
                currentPage={currentPage}
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'currentPage'.
                totalItems={totalItems}
                // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
                perPage={perPage}
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'perPage'.
                prevText={t('pagination.previous')}
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'nextText'.
                nextText={t('pagination.next')}
                // @ts-expect-error ts-migrate(7006) FIXME: Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
                onChangePage={onChangePage}
              // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
              />
            </Panel.Footer>
          </Panel>,
        ]
      )}
    </Stack>
  );
};

Productions.propTypes = {
  ...stackPropTypes,
  productions: PropTypes.array,
  currentPage: PropTypes.number,
  totalItems: PropTypes.number,
  perPage: PropTypes.number,
  onClickProduction: PropTypes.func,
  onChangePage: PropTypes.func,
  className: PropTypes.string,
  loading: PropTypes.bool,
};

Productions.defaultProps = {
  productions: [],
  loading: false,
};

export { Productions };
