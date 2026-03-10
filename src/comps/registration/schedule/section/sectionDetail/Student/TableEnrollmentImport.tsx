import { Table, Badge, ScrollArea, Text, Group, Paper } from "@mantine/core";

interface EnrollmentRow {
  row: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
}

interface Summary {
  total: number;
  validCount: number;
  errorCount: number;
  duplicateCount: number;
  warningCount: number;
  willSaveCount: number;
}

interface Props {
  validatedData: EnrollmentRow[];
  summary: Summary;
}

export default function TableEnrollmentImport({
  validatedData,
  summary,
}: Props) {
  if (!validatedData || validatedData.length === 0) {
    return <Text size="sm">ไม่พบข้อมูล</Text>;
  }

  const headers = Object.keys(validatedData[0].data);

  return (
    <>
      <Paper withBorder p="sm" mb="md" radius="md" id="enrollment-import-summary">
        <Group>
          <Badge color="blue">ทั้งหมด {summary.total}</Badge>
          <Badge color="green">ผ่าน {summary.validCount}</Badge>
          <Badge color="red">ไม่ผ่าน {summary.errorCount}</Badge>
          <Badge color="yellow">ซ้ำ {summary.duplicateCount}</Badge>
          <Badge color="teal">จะบันทึก {summary.willSaveCount}</Badge>
        </Group>
      </Paper>

      <ScrollArea h={300} offsetScrollbars>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>แถว</Table.Th>
              {headers.map((header) => (
                <Table.Th key={header}>{header}</Table.Th>
              ))}
              <Table.Th>สถานะ</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {validatedData.map((item, index) => (
              <Table.Tr
                key={index}
                bg={
                  !item.isValid
                    ? "red.0"
                    : item.isDuplicate
                    ? "white.0"
                    : undefined
                }
              >
                <Table.Td>{item.row}</Table.Td>

                {headers.map((header) => (
                  <Table.Td key={header}>
                    {item.data[header]}
                  </Table.Td>
                ))}

                 <Table.Td>
                  <Group gap={5}>
                    {item.isValid && !item.isDuplicate && (
                      <Badge color="green" size="sm">
                        ผ่าน
                      </Badge>
                    )}

                    {!item.isValid && (
                      <Badge color="red" size="sm">
                        ไม่ผ่าน
                      </Badge>
                    )}

                    {item.isDuplicate && (
                      <Badge color="yellow" size="sm">
                        ซ้ำ
                      </Badge>
                    )}
                  </Group>

                  {!item.isValid && item.errors.length > 0 && (
                    <Text size="xs" c="red" mt={5}>
                      {item.errors.join(", ")}
                    </Text>
                  )}

                  {item.warnings.length > 0 && (
                    <Text size="xs" c="yellow" mt={5}>
                      {item.warnings.join(", ")}
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
