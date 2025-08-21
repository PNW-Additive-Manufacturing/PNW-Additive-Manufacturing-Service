"use client";

import AMForm from "@/app/components/AMForm";
import APIForm from "@/app/components/APIForm";
import { Departments, YearsOfStudy } from "@/app/Types/Account/Account";
import { RegistrationSpan } from "@/app/Types/RegistrationSpan/RegistrationSpan";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { actionRegisterAccountToReregistrationSpan } from "./actions";

export default function Reregistration({ registration }: { registration: RegistrationSpan }) {

    const [isRegistered, setIsRegistered] = useState(false);
    const randomTitle = useMemo(() => getRandomWelcome("Aaron Jung"), []);

    return <>

        <AnimatePresence>

            {isRegistered ? <>

                <motion.div key="registering">
                    <AMForm
                        title={`${registration.name} Registered`}
                        description={<>Welcome back to the <span className="text-pnw-gold">PNW Additive Manufacturing Service</span> — proudly created and maintained by Aaron Jung.</>} />
                </motion.div>

            </> : <>

                <motion.div key="registered">
                    <AMForm
                        title={randomTitle}
                        description={<>To continue using our service, please update your academic and departmental information for the <span className="font-semibold">{registration.name}</span>.</>}>

                        <APIForm action={actionRegisterAccountToReregistrationSpan} submitLabel="Done" onRes={(res) => setIsRegistered(res.success)}>

                            <input name="registration-span-id" hidden readOnly value={registration.id} />

                            <label>Year of Study</label>
                            <select title="Year of Study" required id="year-of-study" name="year-of-study" className="w-full block lg:text-sm">
                                <option disabled>Select your Year of Study</option>
                                {YearsOfStudy.map(y => <option value={y} key={y} id={y}>{y}</option>)}
                            </select>

                            <label>Primary Department</label>
                            <select title="Department" id="department" name="department" className="w-full block lg:text-sm" required>
                                <option disabled>Select your Department</option>
                                {Departments.map(d => <option value={d} key={d} id={d}>{d}</option>)}
                            </select>
                        </APIForm>

                    </AMForm>
                </motion.div>

            </>}

        </AnimatePresence>

    </>
}

const welcomeIntros = [
    "Welcome Back, {{NAME}}.",
    "Good to see you again, {{NAME}}!",
    "You're back! Ready to roll, {{NAME}}?",
    "Ah, the legend returns. Welcome, {{NAME}}.",
    "Back in action, {{NAME}}?",
    "{{NAME}}! The hero we needed.",
    "Welcome home, {{NAME}}.",
    "The vibes just improved — {{NAME}}'s here!",
    "Look who it is... Welcome back!",
    "{{NAME}}, you've been missed!",
    "Welcome back to the zone, {{NAME}}.",
    "Reboot complete. Welcome, {{NAME}}.",
    "Hello again, {{NAME}}. Let's crush it.",
    "The journey continues — welcome back, {{NAME}}.",
    "{{NAME}}, online and ready.",
    "Your throne awaits, {{NAME}}.",
    "Powering up... Welcome back!",
    "Hey {{NAME}}, let's make magic again.",
    "Back so soon, {{NAME}}? We like that."
];

export function getRandomWelcome(name: string): string {
    const index = Math.floor(Math.random() * welcomeIntros.length);
    const template = welcomeIntros[index];
    return template.replace(/{{NAME}}/g, name);
}
