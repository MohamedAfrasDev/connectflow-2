"use client";
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useEntitySearch } from "@/hooks/use-entity-search";

import { formatDistanceToNow} from "date-fns";

import type { Credential } from "@/generated/prisma/client";

import { useCredentialParams } from "../hooks/use-credentials-params";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";


import Image from "next/image";
import { credentialLogos, CredentialTypeClient } from "../constant";

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialParams();

    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams,
    })
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search credential" />
    )
}

export const CredentiaslList = () => {
    const credentials = useSuspenseCredentials();

    return (
        <EntityList
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <Credentialtem data={credential}/>}
            emptyView={<CredentialsEmpty />} />
    )
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
    const router = useRouter();

   
    return (
        <>
            <EntityHeader
                title="Credentials"
                description="Create and manage your credentials"
                newButtonHref="/credentials/new"
                newButtonLabel="New Credential"
                disabled={disabled}
            />
        </>
    )
}


export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialParams();

    return (
        <EntityPagination
            disabled={credentials.isFetching}
            totalPages={credentials.data.totalPages}
            page={credentials.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}


export const CredentialsContainer = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <EntityContainer
            header={<CredentialsHeader />}
            search={<CredentialsSearch />}
            pagination={<CredentialsPagination />}
        >
            {children}

        </EntityContainer>
    )
};

export const CredentialsLoading = () => {
    return <LoadingView message="Loading Credentials" />
}

export const CredentialsError = () => {
    return <ErrorView message="Error loading Credentials" />
}

export const CredentialsEmpty = () => {
    const router = useRouter();

    const handleCreate = () => {
        router.push(`/credentials/new`)
    }
   
    return (
        <>
            <EmptyView
            onNew={handleCreate}
                message="You haven't created any credential yet. Get started by creating your first credential">
                    
            </EmptyView>
        </>
    )
};





export const Credentialtem = ({
    data,
}: {
    data: Credential,
}) => {
    const removeCredential = useRemoveCredential();

    const handleRemove = () => {
        removeCredential.mutate({ id: data.id})
    };

    const logo = credentialLogos[data.type as CredentialTypeClient] || "/logos/openai.svg";
    return (
        <EntityItem
            href={`/credentials/${data.id}`}
            title={data.name}
            subTitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt)}{""} 
                     &bull; Created {""}
                     {formatDistanceToNow(data.createdAt)}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                   <Image src={logo} alt={data.name} width={16} height={16}/>

                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    )
}