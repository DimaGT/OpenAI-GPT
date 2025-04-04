import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../components/AppLayout';
import { getAppProps } from '../utils/getAppProps';

export default function Success() {
  return (
    <div className='h-full overflow-hidden'>
      <div className='w-full h-full flex flex-col overflow-auto'>
        <div className='m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'>
          <h1 className='text-center mt-0'>
            <strong>Success</strong>
          </h1>
          <p className='text-center text-lg'>
            Thank you for your payment! <br />
          </p>
        </div>
      </div>
    </div>
  );
}
Success.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return { props };
  }
});
