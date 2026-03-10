import React, {useState} from 'react';
import {
    Box,
    Heading,
    FormField,
    TablePickerSynced,
    FieldPickerSynced,
    SwitchSynced,
    InputSynced,
    Select,
    Button,
    useBase,
    useGlobalConfig,
} from '@airtable/blocks/ui';
import {exportPresentation} from './exportPptx';

const FIELD_MAPPINGS = [
    {key: 'nameFieldId', label: 'Name'},
    {key: 'followersFieldId', label: 'Followers'},
    {key: 'bioFieldId', label: 'Bio / Headline'},
    {key: 'engagementRateFieldId', label: 'Engagement Rate'},
    {key: 'avgLikesFieldId', label: 'Avg Likes'},
    {key: 'avgCommentsFieldId', label: 'Avg Comments'},
    {key: 'profileImageFieldId', label: 'Profile Image'},
    {key: 'statsImageFieldId', label: 'Stats Image', shouldAllowPickingNone: true},
];

export function ConfigPanel({records, allRecords, fieldMapping, tableName, coverEnabled, coverTitle, coverSubtitle}) {
    const base = useBase();
    const globalConfig = useGlobalConfig();
    const [isExporting, setIsExporting] = useState(false);

    const selectedTableId = globalConfig.get('selectedTableId');
    const selectedTable = selectedTableId
        ? base.getTableByIdIfExists(selectedTableId)
        : null;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportPresentation({
                records,
                fieldMapping,
                coverEnabled,
                coverTitle,
                coverSubtitle,
                tableName,
            });
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Box>
            <Heading size="small" marginBottom={3}>
                Configuration
            </Heading>

            <FormField label="Table">
                <TablePickerSynced globalConfigKey="selectedTableId" />
            </FormField>

            {selectedTable && (
                <Box marginTop={3}>
                    <Heading size="xsmall" marginBottom={2}>
                        Field Mapping
                    </Heading>
                    {FIELD_MAPPINGS.map(({key, label, shouldAllowPickingNone}) => (
                        <FormField key={key} label={label} marginBottom={1}>
                            <FieldPickerSynced
                                table={selectedTable}
                                globalConfigKey={key}
                                shouldAllowPickingNone={shouldAllowPickingNone || false}
                            />
                        </FormField>
                    ))}
                </Box>
            )}

            {selectedTable && (
                <Box marginTop={3} paddingTop={3} borderTop="thick">
                    <Heading size="xsmall" marginBottom={2}>
                        Filter Records
                    </Heading>
                    <FormField label="Filter Field" marginBottom={1}>
                        <FieldPickerSynced
                            table={selectedTable}
                            globalConfigKey="filterFieldId"
                            shouldAllowPickingNone={true}
                            onChange={() => globalConfig.setAsync('filterValue', '')}
                        />
                    </FormField>
                    {globalConfig.get('filterFieldId') && allRecords && (
                        <FormField label="Filter Value" marginBottom={1}>
                            <Select
                                value={globalConfig.get('filterValue') || ''}
                                onChange={(value) => globalConfig.setAsync('filterValue', value)}
                                options={[
                                    {value: '', label: 'All'},
                                    ...[...new Set(
                                        allRecords.map((r) =>
                                            r.getCellValueAsString(globalConfig.get('filterFieldId')),
                                        ).filter(Boolean),
                                    )].sort().map((v) => ({value: v, label: v})),
                                ]}
                            />
                        </FormField>
                    )}
                    {records && (
                        <Box textColor="light" marginTop={1}>
                            Showing {records.length} of {allRecords ? allRecords.length : 0} records
                        </Box>
                    )}
                </Box>
            )}

            <Box marginTop={3} paddingTop={3} borderTop="thick">
                <Heading size="xsmall" marginBottom={2}>
                    Cover Slide
                </Heading>
                <Box marginBottom={2}>
                    <SwitchSynced
                        globalConfigKey="coverEnabled"
                        label="Enable cover slide"
                    />
                </Box>
                {coverEnabled && (
                    <Box>
                        <FormField label="Title" marginBottom={1}>
                            <InputSynced globalConfigKey="coverTitle" placeholder="Presentation Title" />
                        </FormField>
                        <FormField label="Subtitle" marginBottom={1}>
                            <InputSynced globalConfigKey="coverSubtitle" placeholder="Subtitle" />
                        </FormField>
                    </Box>
                )}
            </Box>

            <Box marginTop={3} paddingTop={3} borderTop="thick">
                <Button
                    variant="primary"
                    onClick={handleExport}
                    disabled={!selectedTable || isExporting}
                    width="100%"
                >
                    {isExporting ? 'Exporting...' : 'Export .pptx'}
                </Button>
            </Box>
        </Box>
    );
}
