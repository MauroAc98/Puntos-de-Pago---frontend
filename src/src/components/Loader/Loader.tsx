import style from './Loader.module.css';
import { ProgressSpinner } from 'primereact/progressspinner';
const Loader = () => (
    <>
        <div className={style['back_loader']}></div>
        <div id={style['boxLoader']}>
            <div className='flex align-items-center justify-content-center h-full w-full'>
                <div className={[style['centered_box']].join(" ")}>
                    <ProgressSpinner />
                </div>
            </div>
        </div>
    </>
);

export {Loader} ;