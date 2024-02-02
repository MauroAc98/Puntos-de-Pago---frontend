import { Toast } from 'primereact/toast';
import { useRef, useEffect } from 'react';

export default function CustomToast(props: any) {
  const toast = useRef<any>(null);

  useEffect(() => {
    if (props.show) {
      (props.detail).forEach((obj: any, index: any) => {
        obj.life = 6000 - (index * 1000);
      });

      toast.current.show(props.detail)
    }
  }, [props.detail])

  return <Toast ref={toast} position={props.position} />
}