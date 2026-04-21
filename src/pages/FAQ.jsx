import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';
import faqData from '../data/faq.json';
import { SITE_URL, SITE_NAME } from '../config/site';

export default function FAQ() {
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.flatMap((cat) =>
      cat.questions.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      }))
    ),
  };

  const toggleCategory = (index) => {
    setOpenCategory(openCategory === index ? null : index);
    setOpenQuestion(null);
  };

  const toggleQuestion = (qIndex) => {
    setOpenQuestion(openQuestion === qIndex ? null : qIndex);
  };

  return (
    <div className="container">
      <Helmet>
        <title>{`FAQ — Frequently Asked Questions | ${SITE_NAME}`}</title>
        <meta name="description" content={`Find answers about hiring professionals on ${SITE_NAME} — how it works, pricing, reviews, verification, and more.`} />
        <link rel="canonical" href={`${SITE_URL}/faq`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <h1 className="page-title">Frequently Asked Questions</h1>
      <p className="page-subtitle">Find answers to common questions about our platform</p>
      
      <div className="faq-section">
        {faqData.map((category, catIndex) => (
          <div key={catIndex} className="faq-category">
            <button 
              className={`faq-category-header ${openCategory === catIndex ? 'open' : ''}`}
              onClick={() => toggleCategory(catIndex)}
            >
              <span>{category.category}</span>
              {openCategory === catIndex ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {openCategory === catIndex && (
              <div className="faq-questions">
                {category.questions.map((item, qIndex) => (
                  <div key={qIndex} className="faq-question-item">
                    <button
                      className={`faq-question-header ${openQuestion === qIndex ? 'open' : ''}`}
                      onClick={() => toggleQuestion(qIndex)}
                    >
                      <span>{item.question}</span>
                      {openQuestion === qIndex ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openQuestion === qIndex && (
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}