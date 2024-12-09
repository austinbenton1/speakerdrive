import React from 'react';
import { Link } from 'react-router-dom';

export default function WelcomeMessage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          <span className="bg-gradient-to-r from-[#0066FF] to-[#00B341] bg-clip-text text-transparent">
            Hi, Expert
          </span>
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome to SpeakerDrive AI
        </h2>
      </div>

      <div className="space-y-4 text-gray-600">
        <p>
          My goal is to help you win more engagements. My responses are tailored to add value and align with your goals.
        </p>

        <p>
          I'm your dedicated partner, trained with expertise in the unique needs of speakers, coaches, trainers, facilitators, and any expert looking to gain an edge.
        </p>

        <p className="text-lg font-medium text-gray-900">
          What can we tackle together today?
        </p>
      </div>
    </div>
  );
}