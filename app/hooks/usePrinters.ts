import { useEffect, useState } from 'react';
import { MachineData } from '../components/Machine';

export default function usePrinters(autoRefresh: boolean = false, updateIntervalSeconds: number = 10)
{
    const [machines, setMachines] = useState<MachineData[]>();
    const [isFetching, setIsFetching] = useState(false);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const [failedReason, setFailedReason] = useState<string | null>(null);

    async function fetchMachines() 
    {
        if (isFetching) return;

		try 
        {
            setIsFetching(true);

			const fetchedData = await (await fetch("/api/farm/printers", { cache: "no-cache" })).json();
			console.log("Fetched", fetchedData);

			if (!fetchedData.success) 
            {
                setFailedReason("Unable to reach FarmAPI");
                setIsFetching(false);
                return;
			}

			delete fetchedData.success;

			setMachines((Object.values(fetchedData) as MachineData[]).sort((a, b) => a.model.localeCompare(b.model)));
            setLastFetched(new Date());
            // Clear any previous errors on a successful fetch
            setFailedReason(null); 
		} 
        catch (ex) 
        {
			setFailedReason("An issue occurred fetching machine information!");
		}
        finally
        {
            setIsFetching(false);
        }
	}

    useEffect(() => {

        // Initially fetch machine data.
        fetchMachines();

    }, []);

    useEffect(() => {
        if (autoRefresh)
        {
            const interval = setInterval(async () => await fetchMachines(), updateIntervalSeconds * 1000);
    
            //Clearing the interval
            return () => clearInterval(interval);
        }
    });

    const refresh = async () => await fetchMachines();
    
    return { machines, isFetching, lastFetched, failedReason, refresh };
}