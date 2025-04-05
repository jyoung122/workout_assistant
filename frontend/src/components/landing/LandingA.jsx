import React from "react";


const features = [
  {
    name: 'Personalized Workouts',
    description:
      'Get workouts tailored to your fitness level and goals, whether you are a beginner or an advanced athlete.',
    icon: function Icon() {
      return <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1.5 14H10v-2h3.5zm0-4H10V7h3.5z"/></svg>;
    },
  },
  {
    name: 'Muscle Activation Analytics',
    description:
      'Track muscle activation and performance metrics to optimize your workouts and prevent injuries.',
    icon: function Icon() {
      return <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1.5 14H10v-2h3.5zm0-4H10V7h3.5z"/></svg>;
    },
  },
  {
    name: 'Progress Analytics',
    description:
      'Insights into your volume, intensity, and recovery trends.',
      icon: function Icon() {
      return <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1.5 14H10v-2h3.5zm0-4H10V7h3.5z"/></svg>;
    },
  },
  {
    name: 'Challenge Friends',
    description:
      'Join challenges with friends and track your progress together.',
    icon: function Icon() {
      return <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1.5 14H10v-2h3.5zm0-4H10V7h3.5z"/></svg>;
    },
  },


];

export default function LandingPageA() {
  return (
    <div >

      <div className="relative isolate h-auto px-6 pt-4 lg:px-8 z-10">
          <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('man_powerlift.jpg')" }}></div>
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-100 sm:text-7xl">
                AI-Powered Personalized Fitness 
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-100 sm:text-xl/8">
                Personalized workouts. Muscle activation analytics. Social challenge feeds. Welcome to Fit Ai.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </a>
                <a href="#" className="text-sm/6 font-semibold text-gray-100">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
          
      </div>

      {/* Feature Section */}
      <div className="relative isolate bg-grey py-24 sm:py-32 z-15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-600">Meet your goals faster</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            Elevate your training with real insights
            </p>
            <p className="mt-6 text-lg/8 text-gray-600">
            Whether you're just starting or hitting new PRs, Fit Ai adapts with you.

            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base/7 font-semibold text-gray-900">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
                      <feature.icon aria-hidden="true" className="size-6 text-white" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base/7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="relative isolate bg-gray-900 py-24 sm:py-32 z-15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-600">Join the Revolution</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-100 sm:text-5xl lg:text-balance">
              Start your fitness journey today
            </p>
            <p className="mt-6 text-lg/8 text-gray-400">
              Sign up now and unlock your full potential with Fit Ai.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="flex justify-center">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
    </div>
    </div>
  );
}
