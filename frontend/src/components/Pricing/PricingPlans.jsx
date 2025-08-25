import React, { useState, useEffect } from 'react';
import paymentService, { PLANS } from '../../services/paymentService';

const PricingPlans = ({ currentUser, onPlanSelect, isModal = false }) => {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadCurrentPlan();
      loadUsage();
    }
  }, [currentUser]);

  const loadCurrentPlan = async () => {
    if (!currentUser) return;
    try {
      const planData = await paymentService.getCurrentPlan(currentUser.id);
      setCurrentPlan(planData.plan.id);
    } catch (error) {
      console.error('Error loading current plan:', error);
    }
  };

  const loadUsage = async () => {
    if (!currentUser) return;
    try {
      const usageData = await paymentService.getUsage(currentUser.id);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      if (planId === 'free') {
        // Downgrade to free
        setCurrentPlan('free');
        if (onPlanSelect) onPlanSelect(PLANS.FREE);
      } else {
        // Upgrade to paid plan
        const subscription = await paymentService.createSubscription(
          planId, 
          currentUser.id, 
          'stripe'
        );
        setCurrentPlan(planId);
        if (onPlanSelect) onPlanSelect(PLANS[planId.toUpperCase()]);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Erreur lors de la mise à jour du plan. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ plan, isCurrentPlan }) => (
    <div className={`
      relative rounded-xl border-2 p-6 transition-all duration-200
      ${isCurrentPlan 
        ? 'border-blue-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }
      ${plan.popular ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    `}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Plus populaire
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {paymentService.formatPrice(plan)}
        </div>
        {plan.price > 0 && (
          <p className="text-gray-500 text-sm">Facturation mensuelle</p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {usage && plan.id === currentPlan && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Utilisation actuelle</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Messages:</span>
              <span>
                {plan.limits.messagesPerDay === -1 
                  ? `${usage.messagesUsed} (illimité)`
                  : `${usage.messagesUsed}/${plan.limits.messagesPerDay}`
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span>Images:</span>
              <span>
                {plan.limits.imagesPerDay === -1 
                  ? `${usage.imagesUsed} (illimité)`
                  : `${usage.imagesUsed}/${plan.limits.imagesPerDay}`
                }
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => handleUpgrade(plan.id)}
        disabled={loading || isCurrentPlan}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-colors
          ${isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : plan.popular
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            : 'bg-gray-900 text-white hover:bg-gray-800'
          }
        `}
      >
        {loading ? 'Traitement...' : isCurrentPlan ? 'Plan actuel' : 'Choisir ce plan'}
      </button>
    </div>
  );

  return (
    <div className={`${isModal ? 'p-6' : 'max-w-7xl mx-auto p-8'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choisissez votre plan AlexIQ
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Déverrouillez tout le potentiel d'Alex avec nos plans flexibles. 
          Commencez gratuitement et évoluez selon vos besoins.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Object.values(PLANS).map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlan}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Questions sur nos plans ? 
          <a href="mailto:support@alexiq.site" className="text-blue-600 hover:underline ml-1">
            Contactez-nous
          </a>
        </p>
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <span>✓ Annulation à tout moment</span>
          <span>✓ Support 24/7</span>
          <span>✓ Satisfaction garantie</span>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;