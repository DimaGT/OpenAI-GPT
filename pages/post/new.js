import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../../components/AppLayout';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAppProps } from '../../utils/getAppProps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain } from '@fortawesome/free-solid-svg-icons';

export default function NewPost(props) {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const respone = await fetch(`/api/generatePost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          keywords
        })
      });

      const json = await respone.json();
      if (json?.postId) {
        router.push(`/post/${json.postId}`);
      }
    } catch (error) {
      setGenerating(false);
      console.error('Error generating post:', error);
    }
  };
  return (
    <div className='h-full overflow-hidden'>
      {generating ? (
        <div className='text-violet-600 flex h-full animate-pulse w-full flex-col items-center justify-center'>
          <FontAwesomeIcon icon={faBrain} className='text-8xl' />
          <h6>Generating...</h6>
        </div>
      ) : (
        <div className='w-full h-full flex flex-col overflow-auto'>
          <form
            action=''
            className='m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor=''>
                <strong>Generate a blog post on the topic of:</strong>
              </label>
              <textarea
                className='resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor=''>
                <strong>Targeting the following keywords:</strong>
              </label>
              <textarea
                className='resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm'
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                maxLength={80}
              />
              <small className='block mb-2 color-slate-500'>Separate keywords with commas.</small>
            </div>
            <button className='btn' onClick={handleSubmit} type='submit' disabled={!topic.trim() || !keywords.trim()}>
              Generate
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};
export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    if (!props?.availableTokens) {
      return {
        redirect: {
          destination: '/token-topup',
          permanent: false
        }
      };
    }
    return { props };
  }
});
