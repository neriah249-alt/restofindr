import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const FAQ = () => {
  const faqs = [
    {
      question: "Comment fonctionne RestoGo ?",
      answer: "RestoGo vous permet de découvrir les meilleurs restaurants de Cotonou et Abomey-Calavi. Vous pouvez rechercher des restaurants, voir leurs menus, consulter les avis et réserver directement."
    },
    {
      question: "Comment créer un compte ?",
      answer: "Cliquez sur 'Inscription' en haut de la page, remplissez le formulaire avec votre nom, email et mot de passe, puis validez."
    },
    {
      question: "Comment ajouter un restaurant aux favoris ?",
      answer: "Connectez-vous, puis cliquez sur le cœur ❤️ à côté du nom du restaurant pour l'ajouter à vos favoris."
    },
    {
      question: "Comment devenir restaurateur partenaire ?",
      answer: "Allez dans la section 'Devenir restaurateur' et remplissez le formulaire. Notre équipe vous contactera dans les 48h."
    },
    {
      question: "Les réservations sont-elles gratuites ?",
      answer: "Oui, la réservation via RestoGo est totalement gratuite. Vous serez simplement mis en relation avec le restaurant."
    }
  ];

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-32 pb-12 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-darkText mb-2">❓ Foire Aux Questions</h1>
          <p className="text-gray-500 mb-8">Trouvez les réponses à vos questions les plus fréquentes.</p>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h3 className="font-semibold text-darkText text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default FAQ;