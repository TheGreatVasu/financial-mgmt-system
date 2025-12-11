import React, { useState } from 'react';
import Step1CompanyProfile from '../admin/master-data/Step1CompanyProfile';
import Step2CustomerProfile from '../admin/master-data/Step2CustomerProfile';
import Step3PaymentTerms from '../admin/master-data/Step3PaymentTerms';
import Step4TeamProfiles from '../admin/master-data/Step4TeamProfiles';
import Step5AdditionalStep from '../admin/master-data/Step5AdditionalStep';

const MasterDataForm = ({ initialData = {}, onSubmit, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);

  const handleNext = (data) => {
    const newData = { ...formData, ...data };
    setFormData(newData);
    
    if (step >= 5) {
      onSubmit(newData);
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack?.();
    }
  };

  const renderStep = () => {
    const commonProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      initialData: formData,
    };

    switch (step) {
      case 1:
        return <Step1CompanyProfile {...commonProps} />;
      case 2:
        return <Step2CustomerProfile {...commonProps} />;
      case 3:
        return <Step3PaymentTerms {...commonProps} />;
      case 4:
        return <Step4TeamProfiles {...commonProps} />;
      case 5:
        return <Step5AdditionalStep {...commonProps} />;
      default:
        return <Step1CompanyProfile {...commonProps} />;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex-1 text-center ${
                step === stepNum ? 'font-bold' : 'text-gray-500'
              }`}
            >
              {stepNum === 1 && 'Company'}
              {stepNum === 2 && 'Customer'}
              {stepNum === 3 && 'Payment'}
              {stepNum === 4 && 'Team'}
              {stepNum === 5 && 'Additional'}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default MasterDataForm;
