import Link from "next/link";
import HorizontalWrap from "../components/HorizontalWrap";

export default function TermsAndConditions() {
    return <HorizontalWrap>
        <h1 className="w-fit text-2xl font-normal">
            Terms and Conditions for 3D Printing Services
        </h1>

        <br />

        <h2 className="mt-4 mb-2">1. Adherence to Design for Manufacturing (DFM) Principles</h2>
        <p>
            To ensure successful printing, all uploaded models must adhere to the{" "}
            <Link className="underline" href={"https://formlabs.com/blog/design-for-manufacturing-with-3d-printing/"} target="_blank">
                3D Printing Design for Manufacturing (DFM) principles
            </Link>. Models that do not comply with these standards may be deemed unprintable and rejected. This ensures efficient processing and high-quality results.
        </p>

        <h2 className="mt-8 mb-2">2. Content Restrictions</h2>
        <p>
            Submissions must align with our content guidelines to maintain safety and appropriateness. Violations may result in the rejection of your submission and potential suspension of access to services. The following are strictly prohibited:
            <ul className="list-disc ml-6 mt-2">
                <li>NSFW (Not Safe for Work) content, including explicit, offensive, or inappropriate material.</li>
                <li>Weapons or designs resembling weapons.</li>
                <li>Reselling of submitted models as individual items.</li>
            </ul>
        </p>

        <h2 className="mt-8 mb-2">3. Model Storage</h2>
        <p>
            Uploaded models will be securely stored until the end of the academic year to facilitate any future needs. After this period, models will be permanently deleted to maintain data privacy and storage efficiency. Ensure you save your original files for future use.
        </p>

        <h2 className="mt-8">4. Expedited Requests</h2>
        <p>
            Requests submitted below the minimum lead time for a given material will incur a 20% fee. Please note that completion and delivery dates for such requests are not guaranteed.
        </p>

        <h2 className="mt-8 mb-2">5. Refund Policy</h2>
        <p>
            Refunds are available for specific circumstances and must be handled in person. To qualify, the issue must stem from a service-related error during printing. Refunds are not granted for errors caused by issues in the submitted design itself. Please review your models carefully before submission.
        </p>

        <h2 className="mt-8 mb-2">6. Account Credit Usage</h2>
        <p>
            Any funds deposited into your account are non-refundable and exclusively reserved for 3D printing services. Ensure you plan your budget accordingly, as unused funds cannot be withdrawn or transferred.
        </p>


    </HorizontalWrap>
}