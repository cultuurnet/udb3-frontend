import { Page } from '@/ui/Page';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { Stack } from '@/ui/Stack';
import { Inline } from '@/ui/Inline';
import { Button, ButtonVariants } from '@/ui/Button';

const Ownership = () => {
  return (
    <Page>
      <Page.Title>Hello world</Page.Title>
      <Page.Content>
        <Inline
          display={'grid'}
          css={`
            grid-template-columns: 3fr 1fr;
            gap: 1rem;
          `}
        >
          <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore eos
            nisi maiores. Doloribus molestias magnam facilis! Eum rerum ea fugit
            excepturi doloribus, assumenda quod vitae magni tempore voluptatum
            adipisci aliquam.
          </div>
          <Stack spacing={3}>
            <Button>Nieuwe beheerder toevoegen</Button>
            <Button variant={ButtonVariants.SECONDARY}>
              Terug naar orgonisatiepagina
            </Button>
          </Stack>
        </Inline>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Ownership;
