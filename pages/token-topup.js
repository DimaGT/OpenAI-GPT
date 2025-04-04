import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../components/AppLayout';
import { getAppProps } from '../utils/getAppProps';

export default function TokenTopup() {
  const handleClick = async () => {
    const response = await fetch('/api/addTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();
    window.location.href = json?.session?.url;
  };
  return (
    <div className='h-full overflow-hidden'>
      <div className='w-full h-full flex flex-col overflow-auto'>
        <div className='m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'>
          <h1 className='text-center mt-0'>
            <strong>Token Topup</strong>
          </h1>
          <p className='text-center pb-6 text-lg'>
            You can add tokens to your account by clicking the button below. This will redirect you to Stripe for payment processing.
            <br />
          </p>
          <button className='btn' onClick={handleClick}>
            Add tokens
          </button>
        </div>
      </div>
    </div>
  );
}
TokenTopup.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return { props };
  }
});
