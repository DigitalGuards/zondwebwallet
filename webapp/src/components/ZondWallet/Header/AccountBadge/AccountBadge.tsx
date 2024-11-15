import { Button } from "../../../UI/Button";
import { ROUTES } from "../../../../router/router";
import { useStore } from "../../../../stores/store";
import { Wallet } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";

const AccountBadge = observer(() => {
  const { zondStore } = useStore();
  const {
    activeAccount: { accountAddress },
  } = zondStore;

  const account = accountAddress
    .substring(0, 7)
    .concat("...")
    .concat(accountAddress.substring(accountAddress.length - 5));

  return (
    !!accountAddress && (
      <Link to={ROUTES.ACCOUNT_LIST}>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-foreground"
        >
          <Wallet className="h-4 w-4" />
          {account}
        </Button>
      </Link>
    )
  );
});

export default AccountBadge;
