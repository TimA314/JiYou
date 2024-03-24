import { MetaData } from "../nostr/Types";

export const getMetaDataFromStorage = () => {
    const metaData = localStorage.getItem('metaData');
    if (!metaData) return {};
    const parsedMetaData = JSON.parse(metaData) as MetaData;
    if (!parsedMetaData) return {}

    // Return only non expired metadata
    return Object.values(parsedMetaData).filter((metaData: MetaData) => {
        !isExpired(metaData.lastUpdated)
    });
}

export const saveMetaDataToStorage = (metaDataRecords: Record<string, MetaData>) => {
    try {
        const serializedData = JSON.stringify(metaDataRecords);
        localStorage.setItem('metaData', serializedData);
    } catch (error) {
        console.error("Could not save meta data to local storage:", error);
    }
}

function isExpired(lastUpdated: string | undefined): boolean {
    if (!lastUpdated) return true;
    const daysOld = 3; // TODO make expiration in adjustable in settings
    const lastUpdatedDate = new Date(lastUpdated);
    const currentDate = new Date();
    const differenceInDays = (currentDate.getTime() - lastUpdatedDate.getTime()) / (1000 * 3600 * 24);
    return differenceInDays > daysOld;
}