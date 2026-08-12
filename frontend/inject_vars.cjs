const fs = require('fs');

function injectFilteredVars() {
    const path = 'c:/Users/ASUS/gfs_akomodasi/frontend/src/pages/Laundry.tsx';
    let content = fs.readFileSync(path, 'utf-8');

    // Inject filteredTransactions and filteredReceive
    content = content.replace(
        '  const laundryBagRegister = bagDataResp?.data?.data || [];',
        `  const laundryBagRegister = bagDataResp?.data?.data || [];\n\n  const filteredTransactions = transactions.filter((t: any) => Object.values(t).some(val => String(val).toLowerCase().includes(dropSearch.toLowerCase())));\n  const filteredReceive = transactions.filter((t: any) => t.current_status !== 'DROPPED_AT_POINT' && t.current_status !== 'RETURNED_TO_DROP' && t.current_status !== 'DISTRIBUTED_TO_ROOM').filter((t: any) => Object.values(t).some(val => String(val).toLowerCase().includes(receiveSearch.toLowerCase())));`
    );

    // Inject filteredDeliver after boxList
    content = content.replace(
        '  }, [transactions]);\n\n  const createDropMutation =',
        `  }, [transactions]);\n\n  const filteredDeliver = boxList.filter((b: any) => Object.values(b).some(val => String(val).toLowerCase().includes(deliverSearch.toLowerCase())));\n\n  const createDropMutation =`
    );

    fs.writeFileSync(path, content);
}

injectFilteredVars();
console.log('Injected');
