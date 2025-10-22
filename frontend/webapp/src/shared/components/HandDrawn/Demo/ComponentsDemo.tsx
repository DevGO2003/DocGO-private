import { motion } from 'framer-motion';
import { HandDrawnButton } from '../Button';
import { HandDrawnInput } from '../Input';
import { HandDrawnCard, HandDrawnCardHeader, HandDrawnCardTitle, HandDrawnCardContent } from '../Card';

export const ComponentsDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-gray-900 mb-12"
        >
          Hand-Drawn UI Components
        </motion.h1>

        {/* Buttons Demo */}
        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle>Buttons</HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <div className="flex flex-wrap gap-4">
              <HandDrawnButton variant="primary" animated>
                Primary Button
              </HandDrawnButton>
              <HandDrawnButton variant="secondary" animated>
                Secondary Button
              </HandDrawnButton>
              <HandDrawnButton variant="outline" animated>
                Outline Button
              </HandDrawnButton>
              <HandDrawnButton variant="primary" isLoading>
                Loading...
              </HandDrawnButton>
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>

        {/* Inputs Demo */}
        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle>Input Fields</HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <div className="space-y-6 max-w-md">
              <HandDrawnInput
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
              <HandDrawnInput
                label="Password"
                type="password"
                placeholder="Enter your password"
              />
              <HandDrawnInput
                label="With Error"
                type="text"
                error="This field is required"
                placeholder="Error state"
              />
              <HandDrawnInput
                label="With Helper Text"
                type="text"
                helperText="This is a helper text"
                placeholder="Helper text state"
              />
            </div>
          </HandDrawnCardContent>
        </HandDrawnCard>

        {/* Cards Demo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HandDrawnCard hover>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle>Card 1</HandDrawnCardTitle>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <p className="text-gray-600">
                This is a hand-drawn card with hover effect and animations.
              </p>
            </HandDrawnCardContent>
          </HandDrawnCard>

          <HandDrawnCard hover>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle>Card 2</HandDrawnCardTitle>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <p className="text-gray-600">
                Each card has a unique hand-drawn border created with Rough.js.
              </p>
            </HandDrawnCardContent>
          </HandDrawnCard>

          <HandDrawnCard hover>
            <HandDrawnCardHeader>
              <HandDrawnCardTitle>Card 3</HandDrawnCardTitle>
            </HandDrawnCardHeader>
            <HandDrawnCardContent>
              <p className="text-gray-600">
                Animations powered by Framer Motion and Anime.js for smooth UX.
              </p>
            </HandDrawnCardContent>
          </HandDrawnCard>
        </div>

        {/* Form Example */}
        <HandDrawnCard>
          <HandDrawnCardHeader>
            <HandDrawnCardTitle>Contact Form Example</HandDrawnCardTitle>
          </HandDrawnCardHeader>
          <HandDrawnCardContent>
            <form className="space-y-6 max-w-md">
              <HandDrawnInput
                label="Name"
                type="text"
                placeholder="Your name"
              />
              <HandDrawnInput
                label="Email"
                type="email"
                placeholder="your@email.com"
              />
              <HandDrawnInput
                label="Message"
                type="text"
                placeholder="Your message"
              />
              <HandDrawnButton variant="primary" animated>
                Send Message
              </HandDrawnButton>
            </form>
          </HandDrawnCardContent>
        </HandDrawnCard>
      </div>
    </div>
  );
};
