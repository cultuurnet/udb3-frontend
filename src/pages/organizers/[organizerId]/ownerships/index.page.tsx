import { Page } from '@/ui/Page';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const Ownership = () => {
  return (
    <Page>
      <Page.Title>Hello world</Page.Title>
      <Page.Content>
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore eos
          nisi maiores. Doloribus molestias magnam facilis! Eum rerum ea fugit
          excepturi doloribus, assumenda quod vitae magni tempore voluptatum
          adipisci aliquam.
        </div>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Ownership;
