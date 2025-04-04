import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import clientPromise from '../../lib/mongodb';

const { OpenAI, Configuration } = require('openai');

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db('BlogStandard');

  const userProfile = await db.collection('users').findOne({ auth0Id: user.sub });
  if (!userProfile?.availableTokens) {
    return res.status(403).json({ error: 'User unvaliable tokens' });
  }

  try {
    const openai = new OpenAI({
      api_key: process.env.OPENAI_API_KEY
    });

    const { topic, keywords } = req.body;
    const cleanResponse = (text) => {
      return text
        .replace(/^```html\n/, '')
        .replace(/\n```$/, '')
        .trim();
    };
    const postContentResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates SEO-friendly blog posts.'
        },
        {
          role: 'user',
          content: `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}
                      The content should be formatted in SEO-friendly HTML for paste to body tag.
                      imited to the following HTML tags: p, hl, h2, h3, h4, h5, h6, strong, li, ol, ul, i.`
        }
      ]
    });

    const postContent = cleanResponse(postContentResponse.choices[0]?.message?.content || '');

    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates SEO-friendly blog posts.'
        },
        {
          role: 'user',
          content: `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}
                      The content should be formatted in SEO-friendly HTML for paste to body tag.
                      imited to the following HTML tags: p, hl, h2, h3, h4, h5, h6, strong, li, ol, ul, i.`
        },
        {
          role: 'assistant',
          content: postContent
        },
        { role: 'user', content: 'Generate SEO-friendly title for the above blog post' }
      ]
    });

    const metaDescriptionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates SEO-friendly blog posts.'
        },
        {
          role: 'user',
          content: `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}
                    The content should be formatted in SEO-friendly HTML for paste to body tag.
                    imited to the following HTML tags: p, hl, h2, h3, h4, h5, h6, strong, li, ol, ul, i.`
        },
        { role: 'assistant', content: postContent },
        { role: 'user', content: 'Generate SEO-friendly meta desccription content for the above blog bost' }
      ]
    });

    const title = cleanResponse(titleResponse.choices[0]?.message?.content || '');
    const metaDescription = cleanResponse(metaDescriptionResponse.choices[0]?.message?.content || '');
    await db.collection('users').updateOne(
      {
        auth0Id: user.sub
      },
      {
        $inc: { availableTokens: -1 }
      }
    );

    const post = await db.collection('posts').insertOne({
      title,
      postContent,
      metaDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userProfile._id,
      status: 'draft',
      topic,
      keywords: keywords.split(',').map((keyword) => keyword.trim())
    });
  
    res.status(200).json({ postId: post.insertedId });
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
