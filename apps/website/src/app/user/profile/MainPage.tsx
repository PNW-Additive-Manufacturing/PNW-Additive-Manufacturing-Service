"use client"

import { editName, editPassword } from "@/app/api/server-actions/account";
import GenericFormServerAction from "@/app/components/GenericFormServerAction";
import { Input } from "@/app/components/Input";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useState } from "react";
export default function EditPage({userInfo} : {userInfo: {firstname: string, lastname: string}}) {
  //boolean that displays a "change successful" message if true
  let [submitSuccess, setSubmitSuccess] = useState(false);

  let scrollTopAfterSuccess = () => {

    //smooth scroll to top of screen where Change Success message appears
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })

    setSubmitSuccess(true); 
  };

  //used to display success message at top of page if name change is successful
  let nameChangeAction = async (prevState: string, formData: FormData) => {
    let errMessage = await editName(prevState, formData);

    if(errMessage) {
      setSubmitSuccess(false);
      return errMessage;
    }

    scrollTopAfterSuccess();
    setSubmitSuccess(true);
    return "";
  }

  return (
    <main>

      <div className="w-9/10 m-auto">
        <big className="text-green-600">{submitSuccess ? "Change Successful!" : ""}</big>
        <h1>Your Profile</h1>

        <GenericFormServerAction serverAction={nameChangeAction} submitName="Edit Name" submitPendingName="Changing Name...">
          <Input label="First Name" type="text" id="firstname" name="firstname" placeholder="First Name" defaultValue={userInfo.firstname}/>
          <Input label="Last Name" type="text" id="lastname" name="lastname" placeholder="Last Name" defaultValue={userInfo.lastname}/>
        </GenericFormServerAction>
        <br/>
        <ChangePasswordForm successCallback={scrollTopAfterSuccess} errCallback={() => setSubmitSuccess(false)}/>
      </div>
    </main>
  );
}