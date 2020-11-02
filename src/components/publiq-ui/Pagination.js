import { Pagination as BootstrapPagination } from 'react-bootstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme(`pagination`);

const StyledPagination = styled(BootstrapPagination)`
  .page-link {
    color: ${getValue('color')};
    border-color: ${getValue('borderColor')};
    padding: ${getValue('paddingY')} ${getValue('paddingX')};
    &:hover {
      background-color: ${getValue('hoverBackgroundColor')};
      color: ${getValue('hoverColor')};
    }
    &:focus {
      box-shadow: ${getValue('focusBoxShadow')};
    }
  }

  & > .page-item.active > .page-link {
    background-color: ${getValue('activeBackgroundColor')};
    color: ${getValue('activeColor')};
    border-color: ${getValue('activeBorderColor')};
  }

  .prev-btn {
    margin-right: 0.2rem;
  }

  .next-btn {
    margin-left: 0.2rem;
  }
`;

const Pagination = ({
  className,
  currentPage,
  totalItems,
  perPage,
  prevText,
  nextText,
  onChangePage,
}) => {
  const pages = [];
  for (let i = 0; i < Math.ceil(totalItems / perPage); i++) {
    pages.push(i + 1);
  }

  return (
    <StyledPagination className={className}>
      <StyledPagination.Prev
        className="prev-btn"
        disabled={currentPage === 1}
        onClick={() => {
          if (currentPage > 1) {
            onChangePage(currentPage - 1);
          }
        }}
      >
        {prevText}
      </StyledPagination.Prev>
      {pages.map((page) => (
        <StyledPagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => {
            onChangePage(page);
          }}
        >
          {page}
        </StyledPagination.Item>
      ))}
      <StyledPagination.Next
        className="next-btn"
        disabled={currentPage === pages.length}
        onClick={() => {
          if (currentPage < pages.length) {
            onChangePage(currentPage + 1);
          }
        }}
      >
        {nextText}
      </StyledPagination.Next>
    </StyledPagination>
  );
};

Pagination.propTypes = {
  className: PropTypes.string,
  currentPage: PropTypes.number,
  totalItems: PropTypes.number,
  perPage: PropTypes.number,
  prevText: PropTypes.string,
  nextText: PropTypes.string,
  onChangePage: PropTypes.func,
};

Pagination.defaultProps = {
  currentPage: 1,
  totalItems: 1,
  perPage: 10,
  prevText: 'Previous',
  nextText: 'Next',
};

export { Pagination };
