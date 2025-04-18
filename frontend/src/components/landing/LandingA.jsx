import React from "react";
import { PencilSquareIcon, ChartBarIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/outline';


const features = [
  {
    name: 'Workout Logging',
    description:
      'Forget rigid, preset lists. Log your workouts in your own words and let our NLP engine identify the exercise and the muscles it targets.',
    icon: PencilSquareIcon
  },
  {
    name: 'Muscle Activation Insights',
    description:
      'Visualize which muscles are working during your lifts, so you can understand your training better than ever before.',
    icon: ChartBarIcon
  },
  {
    name: 'Recovery Analytics',
    description:
      'Receive personalized recovery recommendations—know exactly which muscles should be recovering and which are ready for your next challenge.',
      icon: HeartIcon
  },
  {
    name: 'Social Community',
    description:
      'Join a community of people who share their journey, offer support, and celebrate every milestone together.',
    icon: UserGroupIcon
  },


];

export default function LandingPageA() {
  return (
    <div >
      <div className="overflow-hidden bg-white py-24 sm:py-32">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pt-4 lg:pr-8">
              <div className="lg:max-w-lg">
                <h2 className="text-4xl/7 font-semibold text-blue-800">Elevate Your Workout.</h2>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-pretty text-grey-800">
                Unlock professional-grade insights and recovery analytics—without the hassle of preset workout lists.
                </p>
                <p className="mt-6 text-lg/8 text-gray-950">
                  At Lifta.fit, we believe every lifter—whether you’re just starting out or you’re already a gym veteran—deserves to know exactly what’s happening with every rep, set, and muscle. Our innovative NLP-powered workout logging lets you simply text your workout, and our smart algorithms decode the exercise details, muscle activations, and recovery needs. This means you get tailored, real-time insights that empower you to train smarter and recover better.
                </p>
  
              </div>
            </div>
            <img
              alt="Product screenshot"
              src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
              width={2432}
              height={1442}
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            />
          </div>
        </div>
        </div>


      <div className="relative isolate h-auto px-6 pt-4 lg:px-8 z-10">
          <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('man_powerlift.jpg')" }}></div>
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-100 ">
              Lifta.fit – Elevate Your Workout.</h1>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-100 sm:text-xl/8">
              Track your lifts as if you’re texting your coach.
              Unlock professional-grade insights and recovery analytics—without the hassle of preset workout lists.

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
            <div className="text-3xl font-semibold text-indigo-600">All-In-One Workout Tracking & Recovery Insights</div>
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
