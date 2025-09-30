"use client";

import { APIData } from "@/app/api/APIResponse";
import { addFunds, changePermission } from "@/app/api/server-actions/account";
import { formateDate } from "@/app/api/util/Constants";
import APIForm from "@/app/components/APIForm";
import DropdownSection from "@/app/components/DropdownSection";
import FormSubmitButton from "@/app/components/FormSubmitButton";
import Account, { AccountPermission, AccountWithTransactions } from "@/app/Types/Account/Account";
import { WalletTransaction, WalletTransactionStatus } from "@/app/Types/Account/Wallet";
import { RegularBan, RegularCheckmark, RegularCirclePlus, RegularTrashCan, RegularWarning } from "lineicons-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

export default function AccountManager({ accounts }: { accounts: AccountWithTransactions[] }) {
    const [selectedAccount, setSelectedAccount] = useState<AccountWithTransactions | null>();
    const [filteredAccounts, setFilteredAccounts] = useState<AccountWithTransactions[]>(accounts);

    const [_, addFundsAction] = useFormState<APIData<WalletTransaction> | undefined>((async (data: any, formData: FormData) => {
        const result = await addFunds(data, formData);

        if (result.success) {
            toast.success(`Successfully added \$${formData.get("amount-in-dollars")} to the account of ${selectedAccount?.firstName} ${selectedAccount?.lastName}.`);

            if (selectedAccount) {
                selectedAccount.transactions.push(result);
                selectedAccount.balanceInDollars += (result.amountInCents / 100);
            }
        }
        else {
            toast.error(`Failed to allocate funds to ${selectedAccount?.firstName} ${selectedAccount?.lastName}.`);
            console.error(result.errorMessage);
        }


        return result;
    }) as any, undefined);

    const permissionFilterElemRef = useRef<HTMLSelectElement>();

    const accountsByPermission = (permission: AccountPermission) => accounts.filter(a => a.permission == permission);
    const accountsUnverified = accounts.filter(a => !a.isEmailVerified);

    function applyFilters(content?: string, permission?: AccountPermission | "everyone") {
        let newFilteredAccounts = accounts;

        if (content) {
            newFilteredAccounts = accounts.filter(a =>
                `${a.firstName} ${a.lastName}`.toLowerCase().includes(content.toLowerCase())
                || a.email.toLowerCase().includes(content.toLowerCase())
                || (a.department && a.department.toLowerCase().includes(content.toLowerCase())));
        }

        if (permission) {
            newFilteredAccounts = accounts.filter(a => permission == "everyone" ? true : a.permission == permission);
        }

        setFilteredAccounts(newFilteredAccounts);
    }

    return <>

        <h1 className="text-2xl tracking-wide font-light mb-6">
            Accounts
        </h1>
        <div className="lg:grid grid-cols-2 max-lg:pb-2 bg-white out">

            <div className="p-4">
                <div className="bg-background p-4 mb-4 out">
                    <label>Statistics</label>
                    <div className="flex gap-3 flex-wrap text-sm rounded-md">
                        <p><span className="text-pnw-gold">{accounts.length}</span> Accounts</p>
                        <p><span className="text-pnw-gold">{accountsByPermission(AccountPermission.Admin).length}</span> Admins</p>
                        <p><span className="text-pnw-gold">{accountsByPermission(AccountPermission.Maintainer).length}</span> Maintainers</p>
                        <p><span className="text-pnw-gold">{accountsByPermission(AccountPermission.User).length}</span> Users</p>
                        <p><span className="text-pnw-gold">{accountsUnverified.length}</span> Unverified</p>
                    </div>
                </div>

                {/* <label>Search</label> */}
                <div className="lg:flex gap-4">
                    <input type="text" className="p-2 text-sm rounded-sm px-3" placeholder="Search name, email or department" onChange={(ev) => applyFilters(ev.currentTarget.value)}></input>
                    <select title="Permission" ref={permissionFilterElemRef as any} className="w-fit text-sm" defaultValue={"everyone"} onChange={(ev) => applyFilters(undefined, ev.currentTarget.value as any)}>
                        <option value="everyone">Everyone</option>
                        <option value={AccountPermission.Admin}>Admin</option>
                        <option value={AccountPermission.Maintainer}>Maintainer</option>
                        <option value={AccountPermission.User}>User</option>
                    </select>
                </div>

                <label className="text-xs">Showing {filteredAccounts.length} Account(s)</label>
                <div className="flex flex-col gap-2 overflow-y-scroll" style={{ maxHeight: "500px" }}>
                    {filteredAccounts.map(account => <div className={`w-full rounded-md text-sm bg-background flex justify-between p-3 hover:bg-pnw-gold hover:text-white hover:fill-white hover:cursor-pointer transition-colors ${selectedAccount == account && "bg-pnw-gold text-white fill-white"}`} onClick={() => setSelectedAccount(account)}>
                        <span>
                            <span className="mr-2">{account.isEmailVerified ? <><RegularCheckmark className="inline fill-inherit"></RegularCheckmark></> : <><RegularWarning className="inline fill-red-300 mr-2"></RegularWarning> Unverified</>}</span>

                            {account.firstName} {account.lastName} ({account.yearOfStudy})
                        </span>
                        <span>{formateDate(account.joinedAt)}</span>
                    </div>)}
                </div>
            </div>
            <div className="m-4 p-4 flex-grow bg-background rounded-md out">

                {selectedAccount ? <>

                    <h2 className="lg:flex gap-2 justify-between text-xl font-normal mb-2 text-pnw-gold">{selectedAccount.firstName} {selectedAccount.lastName}</h2>

                    <APIForm action={changePermission}>

                        <input type="hidden" name="user-email" value={selectedAccount.email} />
                        <select className="outline-none inline w-fit mb-0" name="new-permission" defaultValue={selectedAccount.permission}>
                            <option key={AccountPermission.Admin} value={AccountPermission.Admin}>Administrator</option>
                            <option value={AccountPermission.Maintainer}>Maintainer</option>
                            <option value={AccountPermission.User}>User</option>
                        </select>

                    </APIForm>

                    <label>Account Details</label>
                    <ul>
                        {selectedAccount.yearOfStudy && <li><p className="text-sm">Joined as {selectedAccount.yearOfStudy}</p></li>}
                        {selectedAccount.department && <li><p className="text-sm">College of {selectedAccount.department}</p></li>}
                        <li><p><a className="underline text-sm" href={`mailto:${selectedAccount.email}`}>Contact at {selectedAccount.email}</a></p></li>
                    </ul>

                    <DropdownSection className="text-sm px-0 mt-2" hidden={true} name={`${selectedAccount.firstName} ${selectedAccount.lastName} has \$${selectedAccount.balanceInDollars.toFixed(2)}`}>

                        <form action={addFundsAction}>
                            <div className="lg:flex gap-2">
                                <input className="bg-white py-2.5 text-sm mb-0 px-3" type="text" id="amount-in-dollars" name="amount-in-dollars" required placeholder="$0.00" />
                                <select title="Method" defaultValue={"none"} className="bg-white py-2.5 text-sm w-fit mb-0" id="transaction-type" name="transaction-type" required>
                                    <option value="none" disabled selected>Choose Method</option>
                                    <option value="cash">Cash</option>
                                    <option value="gift">Gift</option>
                                </select>
                                <input type="text" id="account-email" name="account-email" value={selectedAccount.email} readOnly hidden />
                                <div className="w-fit text-xs text-white">
                                    <FormSubmitButton className="mb-0" label={"Add Funds"}></FormSubmitButton>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-0.5 py-3 text-sm">
                                <input title="Send Email" id="send-email" name="send-email" className="mb-0 outline-none w-3.5 h-3" type="checkbox" defaultChecked={true} />
                                <p>Send an email to {selectedAccount.firstName} with the receipt attached.</p>
                            </div>
                        </form>

                        <label className="text-xs">Transactions</label>
                        {selectedAccount.transactions.length == 0 ? <p className="text-sm">No transactions Found</p> : <>

                            <div className="flex flex-col gap-2">
                                {selectedAccount.transactions.map((value) => (
                                    <div
                                        className={`p-4 text-sm outline outline-1 ${value.paymentStatus ==
                                            WalletTransactionStatus.Paid
                                            ? "outline-gray-300"
                                            : "outline-yellow-700"
                                            } bg-white rounded-md flex justify-between items-center`}>
                                        <div className="flex items-center">
                                            {value.paymentStatus ==
                                                WalletTransactionStatus.Paid ? (
                                                <RegularCirclePlus className="h-4 w-auto fill-green-600 mr-2"></RegularCirclePlus>
                                            ) : (
                                                <RegularCirclePlus className="h-4 w-auto fill-yellow-700 mr-2"></RegularCirclePlus>
                                            )}
                                            ${(value.amountInCents / 100).toFixed(2)}
                                        </div>
                                        <div className="text-xs">
                                            {value.paymentStatus ==
                                                WalletTransactionStatus.Paid ? (
                                                <>
                                                    {value.paymentMethod.toUpperCase()}{" "}
                                                    On{" "}
                                                    {value.paidAt!.toLocaleDateString(
                                                        "en-us",
                                                        {
                                                            weekday: "long",
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "numeric"
                                                        }
                                                    )}
                                                </>
                                            ) : value.paymentStatus ==
                                                WalletTransactionStatus.Cancelled ? (
                                                "Cancelled"
                                            ) : (
                                                "Pending Transaction"
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </>}

                    </DropdownSection>

                    {/* <DropdownSection className="text-sm px-0 mt-2" name={"Account Management"} hidden={true}>
                        <div className="lg:flex gap-4">
                            <button disabled={true} className="bg-white text-black font-light out hover:bg-red-300 hover:text-white hover:fill-white fill-red-500 text-sm"><RegularBan className="inline mb-1 fill-inherit"></RegularBan> Ban from Platform</button>
                            <button disabled={true} className="bg-white text-black font-light out hover:bg-red-300 hover:text-white hover:fill-white fill-red-500 text-sm"><RegularTrashCan className="inline mb-1 fill-inherit"></RegularTrashCan> Delete all Requests</button>
                        </div>
                    </DropdownSection> */}

                </> : <div className="flex w-full h-full justify-center items-center">Account has not been Selected!</div>}


            </div>

        </div>

    </>;
}