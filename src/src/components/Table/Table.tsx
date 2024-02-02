import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import styles from "./table.module.css";

interface TableProps {
    columns: any,
    data: any,
    selection?: any,
    onSelectionChange?: any,
    showCheckBoxRow?: boolean,
    onRowDoubleClick?: any
    isDataSelectable?: (event: any) => boolean
    rowClassName?: any
    onRowSelect?: any
    onRowUnselect?: any
    onAllRowsSelect?: any
    onAllRowsUnselect?: any
    isPaginator?: any
}

export default function Table({ columns, data, selection, onSelectionChange, showCheckBoxRow = false, onRowDoubleClick, isDataSelectable, rowClassName, onRowUnselect, onRowSelect,
    onAllRowsSelect,
    onAllRowsUnselect, isPaginator }: TableProps) {
    const dynamicColumns = columns.map((col: any, i: any) => {
        if (col.visibility) {
            return (
                <Column
                    key={col.field}
                    field={col.field}
                    header={col.name}
                    body={col.body}
                    bodyClassName={col.bodyClassName}
                    align={col.align}
                    sortable
                    headerStyle={{ backgroundColor: '#4f2255', color: '#ffffff' }}
                    
                />
            );
        }
    });

    const paginatorTemplate = {
        layout: 'RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink',
        'RowsPerPageDropdown': (options: any) => {
            const dropdownOptions = [
                { label: 5, value: 5 },
                { label: 10, value: 10 },
                { label: 20, value: 20 },
                { label: 50, value: 50 }
            ];

            return (
                <>
                    <div className='mt-3'>
                        <span className={["mx-1", styles['rows_per_page']].join(" ")}>Items por página: </span>
                        <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />
                    </div>
                </>
            );
        },
        'CurrentPageReport': (options: any) => {
            return (
                <span className={["mt-3", styles['current_page_report']].join(" ")}>
                    {options.first} - {options.last} de {options.totalRecords}
                </span>
            )
        },
        'PrevPageLink': (options: any) => {
            return (
                <button type="button" className={["mt-3", styles['paginator_left']].join(" ")} onClick={options.onClick} disabled={options.disabled}>
                    <i className="pi pi-chevron-left"></i>
                </button>
            )
        },
        'NextPageLink': (options: any) => {
            return (
                <button type="button" className={["mt-3", styles['paginator_right']].join(" ")} onClick={options.onClick} disabled={options.disabled}>
                    <i className="pi pi-chevron-right"></i>
                </button>
            )
        },
    };
    const handleSelectionChange = (event: any) => {
        if (typeof onSelectionChange == 'function') {
            onSelectionChange(event.value);
        }
    }


    return (
        <DataTable
            value={data}
            paginator
            paginatorTemplate={isPaginator && paginatorTemplate}
            paginatorClassName={styles['paginator_class']}
            first={0}
            rows={5}
            onRowDoubleClick={onRowDoubleClick}
            responsiveLayout="scroll"
            selection={selection}
            sortField={selection}
            sortOrder={1}
            onSelectionChange={handleSelectionChange}
            isDataSelectable={isDataSelectable}
            rowClassName={rowClassName}
            onRowSelect={onRowSelect}
            onRowUnselect={onRowUnselect}
            onAllRowsSelect={onAllRowsSelect}
            onAllRowsUnselect={onAllRowsUnselect}
        >
            {showCheckBoxRow && <Column selectionMode="multiple" headerStyle={{ width: '3em', backgroundColor: '#4f2255', color: '#ffffff' }}></Column>}
            {dynamicColumns}

        </DataTable>
    )
}