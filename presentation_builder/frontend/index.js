import React from 'react';
import {
    initializeBlock,
    Box,
    useBase,
    useGlobalConfig,
    useRecords,
} from '@airtable/blocks/ui';
import {ConfigPanel} from './ConfigPanel';
import {PreviewPanel} from './PreviewPanel';

function App() {
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const selectedTableId = globalConfig.get('selectedTableId');
    const selectedTable = selectedTableId
        ? base.getTableByIdIfExists(selectedTableId)
        : null;
    const allRecords = useRecords(selectedTable);

    const filterFieldId = globalConfig.get('filterFieldId') || null;
    const filterValue = globalConfig.get('filterValue') || null;

    const records = React.useMemo(() => {
        if (!allRecords) return null;
        if (filterFieldId && filterValue) {
            return allRecords.filter(
                (record) => record.getCellValueAsString(filterFieldId) === filterValue,
            );
        }
        return allRecords;
    }, [allRecords, filterFieldId, filterValue]);

    const fieldMapping = {
        nameFieldId: globalConfig.get('nameFieldId') || null,
        followersFieldId: globalConfig.get('followersFieldId') || null,
        bioFieldId: globalConfig.get('bioFieldId') || null,
        engagementRateFieldId: globalConfig.get('engagementRateFieldId') || null,
        avgLikesFieldId: globalConfig.get('avgLikesFieldId') || null,
        avgCommentsFieldId: globalConfig.get('avgCommentsFieldId') || null,
        profileImageFieldId: globalConfig.get('profileImageFieldId') || null,
        statsImageFieldId: globalConfig.get('statsImageFieldId') || null,
    };

    const coverEnabled = globalConfig.get('coverEnabled') !== false;
    const coverTitle = globalConfig.get('coverTitle') || '';
    const coverSubtitle = globalConfig.get('coverSubtitle') || '';

    return (
        <Box display="flex" height="100vh">
            <Box width="340px" padding={3} borderRight="thick" overflow="auto">
                <ConfigPanel
                    records={records}
                    allRecords={allRecords}
                    fieldMapping={fieldMapping}
                    tableName={selectedTable ? selectedTable.name : ''}
                    coverEnabled={coverEnabled}
                    coverTitle={coverTitle}
                    coverSubtitle={coverSubtitle}
                />
            </Box>
            <Box flex="1" padding={3} display="flex" overflow="hidden">
                <PreviewPanel
                    records={records}
                    fieldMapping={fieldMapping}
                    coverEnabled={coverEnabled}
                    coverTitle={coverTitle}
                    coverSubtitle={coverSubtitle}
                />
            </Box>
        </Box>
    );
}

initializeBlock(() => <App />);
