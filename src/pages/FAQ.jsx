import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import faqData from '../data/faq.json';

export default function FAQ() {
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleCategory = (index) => {
    setOpenCategory(openCategory === index ? null : index);
    setOpenQuestion(null);
  };

  const toggleQuestion = (qIndex) => {
    setOpenQuestion(openQuestion === qIndex ? null : qIndex);
  };

  return (
    <div className="container">
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